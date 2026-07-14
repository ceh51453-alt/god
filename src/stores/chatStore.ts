import { create } from 'zustand';
import type { GamePath, CharacterData } from '@/components/creation/creationData';
import { defaultCharacter } from '@/components/creation/creationData';
import type { StatData } from '@/engine/mvu/schema';
import { StatDataSchema, defaultTime } from '@/engine/mvu/schema';
import type { MvuPatchOp } from '@/engine/mvu/patchEngine';
import { applyPatches, filterAIPatches } from '@/engine/mvu/patchEngine';
import { deriveAffinityStage } from '@/engine/mvu/schema';
import { normalizeTime } from '@/engine/mvu/timeEngine';
import { resolveEntityPatches } from '@/engine/canon/entityRegistry';
import { guardPatches } from '@/engine/canon/canonGuard';
import { saveSnapshot, clearSnapshots, rollbackTo, exportSnapshots, importSnapshots } from '@/engine/mvu/snapshot';
import { extractPatches } from '@/engine/mvu/extractor';
import { saveSlot, loadSlot, deleteSlot, getActiveSlotId, setActiveSlotId, clearActiveSlotId, createSlot } from './saveManager';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  rawContent?: string;        // Original AI response (before tag stripping)
  cleanContent?: string;      // Narrative text (after tag stripping)
  thinkingText?: string;      // AI thinking/reasoning content
  timestamp: number;
  streaming?: boolean;
  retryCount?: number;
  turnNumber?: number;
  /** Reroll variants */
  variants?: { content: string; rawContent: string; patches: MvuPatchOp[] }[];
  activeVariant?: number;
  /** Patches extracted from this message */
  patches?: MvuPatchOp[];
}

export interface GameState {
  path: GamePath | null;
  godName: string;
  gameStarted: boolean;
  turnCount: number;
  character: CharacterData;
}

export type ViewId = 'chat' | 'world' | 'status_full' | 'powers' | 'relations' | 'codex' | 'studio';

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
  streamingThinkingText: string;
  retryingAttempt: number | null;
  retryingMax: number | null;

  game: GameState;

  /** MVU State — single source of truth */
  statData: StatData;

  /** Active save slot ID */
  activeSlotId: string | null;

  showSettings: boolean;
  activeView: ViewId;
  showStatusPanel: boolean;

  /** Lệnh sáng tạo từ Xưởng Sáng Thế, chờ ChatPanel gửi cho AI */
  pendingDecree: string | null;

  // Actions
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string, thinkingText?: string) => void;
  setStreaming: (streaming: boolean, text?: string) => void;
  appendStreamText: (chunk: string) => void;
  appendStreamThinkingText: (chunk: string) => void;
  setRetrying: (attempt: number | null, max?: number | null) => void;
  clearMessages: () => void;

  setGame: (updates: Partial<GameState>) => void;
  setShowSettings: (show: boolean) => void;
  setActiveView: (view: ViewId) => void;
  setShowStatusPanel: (show: boolean) => void;
  setPendingDecree: (text: string | null) => void;
  updateSettings: (partial: Partial<StatData['settings']>) => void;
  setActiveSlot: (id: string | null) => void;

  // MVU Actions
  initStatData: (character: CharacterData, path: GamePath) => void;
  applyMvuPatches: (patches: MvuPatchOp[]) => void;
  /** Áp patch từ pass nền (world-sim / canon-fix) qua đúng pipeline an toàn, KHÔNG tăng lượt. */
  applyBackgroundPatches: (rawPatches: MvuPatchOp[]) => { applied: number; dropped: number };
  processAIResponse: (rawContent: string) => { cleanText: string; patches: MvuPatchOp[] };
  rollbackToTurn: (turn: number) => boolean;
  /** Xóa lượt gần nhất (user + assistant) và khôi phục state 1 snapshot. */
  rewindOneTurn: () => boolean;

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: (slotId?: string) => boolean;
  clearSave: () => void;
}

function saveToActiveSlot(game: GameState, messages: ChatMessage[], statData: StatData) {
  const slotId = useChatStore.getState().activeSlotId;
  if (!slotId) return;
  saveSlot(slotId, {
    game,
    // Bỏ placeholder đang stream để reload giữa chừng không để lại bong bóng rỗng
    messages: messages.filter(m => !m.streaming),
    statData,
    snapshots: exportSnapshots(),
    version: 2,
  });
}

function loadFromSlot(slotId: string): { game: GameState; messages: ChatMessage[]; statData?: StatData } | null {
  const data = loadSlot(slotId);
  if (!data) return null;
  // Import snapshots if present
  if (data.snapshots) {
    importSnapshots(data.snapshots as Parameters<typeof importSnapshots>[0]);
  }
  return data;
}

/** Initialize StatData from character creation data */
function buildInitialStatData(character: CharacterData, path: GamePath): StatData {
  const base = StatDataSchema.parse({
    path,
    name: character.name,
    title: character.title,
    age: character.age ?? undefined,
    attributes: { ...character.attributes },
    traits: [...character.traits],
    resources: {
      power: path === 'creator' ? 1000 : path === 'god' ? 500 : 50,
      followers: path === 'god' ? 100 : 0,
      wealth: path === 'mortal' ? 50 : 0,
      faith: path === 'god' ? 30 : 0,
      karma: 0,
      progress: 0,
    },
    world: {
      era: character.era,
      eraDescription: character.eraDescription,
      region: character.region,
      faction: character.faction,
      cosmicDomain: character.cosmicDomain,
      divineRealm: character.divineRealm,
      mortalOrigin: character.mortalOrigin,
      mortalClass: character.mortalClass,
      reputation: character.reputation,
      crisis: character.crisis,
      cosmicRules: character.cosmicRules,
      pantheonName: character.pantheonName,
      appearance: character.appearance,
      time: { ...defaultTime(), epochLabel: character.era || '' },
    },
    companion: {
      name: character.followerName,
      description: character.followerDesc,
      attributes: { ...character.followerAttributes },
    },
    _seed: Math.floor(Math.random() * 2147483647),
    _turnCount: 0,
    _version: 1,
  });
  return base;
}

/** Run derived effects after patch application */
function runDerivedEffects(state: StatData): StatData {
  let result = { ...state };

  // Derive affinity stages for all NPCs
  if (result.npcs) {
    const npcs = { ...result.npcs };
    for (const [key, npc] of Object.entries(npcs)) {
      const stage = deriveAffinityStage(npc.affinity);
      if (npc._affinityStage !== stage) {
        npcs[key] = { ...npc, _affinityStage: stage };
      }
    }
    result.npcs = npcs;
  }

  // Chuẩn hóa đồng hồ in-world (dồn tràn Ngày→Mùa→Năm, chặn lùi)
  result = normalizeTime(result);

  return result;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingText: '',
  streamingThinkingText: '',
  retryingAttempt: null,
  retryingMax: null,

  game: {
    path: null,
    godName: '',
    gameStarted: false,
    turnCount: 0,
    character: { ...defaultCharacter },
  },

  statData: StatDataSchema.parse({}),
  activeSlotId: null,

  showSettings: false,
  activeView: 'chat',
  showStatusPanel: true,
  pendingDecree: null,

  addMessage: (msg) => {
    set(state => ({
      messages: [...state.messages, {
        ...msg,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
      }],
    }));
    setTimeout(() => {
      const s = get();
      if (s.game.gameStarted) saveToActiveSlot(s.game, s.messages, s.statData);
    }, 100);
  },

  updateLastAssistantMessage: (content, thinkingText) => {
    set(state => {
      const msgs = [...state.messages];
      for (let i = msgs.length - 1; i >= 0; i--) {
        if (msgs[i].role === 'assistant') {
          msgs[i] = {
            ...msgs[i],
            content,
            streaming: false,
            ...(thinkingText != null && { thinkingText }),
          };
          break;
        }
      }
      return { messages: msgs };
    });
    // Persist the finalized/aborted message so a reload keeps it
    const s = get();
    if (s.game.gameStarted) saveToActiveSlot(s.game, s.messages, s.statData);
  },

  setStreaming: (streaming, text = '') => set({
    isStreaming: streaming,
    streamingText: streaming ? text : '',
    streamingThinkingText: streaming ? '' : '',
  }),

  appendStreamText: (chunk) => set(state => ({
    streamingText: state.streamingText + chunk,
  })),

  appendStreamThinkingText: (chunk) => set(state => ({
    streamingThinkingText: state.streamingThinkingText + chunk,
  })),

  setRetrying: (attempt, max = null) => set({
    retryingAttempt: attempt,
    retryingMax: max,
  }),

  clearMessages: () => set({ messages: [], streamingText: '' }),

  setGame: (updates) => {
    set(state => ({
      game: { ...state.game, ...updates },
    }));
    setTimeout(() => {
      const s = get();
      if (s.game.gameStarted) saveToActiveSlot(s.game, s.messages, s.statData);
    }, 100);
  },

  setShowSettings: (show) => set({ showSettings: show }),
  setActiveView: (view) => set({ activeView: view }),
  setShowStatusPanel: (show) => set({ showStatusPanel: show }),
  setPendingDecree: (text) => set({ pendingDecree: text }),

  updateSettings: (partial) => {
    set(state => ({
      statData: { ...state.statData, settings: { ...state.statData.settings, ...partial } },
    }));
    const s = get();
    if (s.game.gameStarted) saveToActiveSlot(s.game, s.messages, s.statData);
  },
  setActiveSlot: (id) => {
    set({ activeSlotId: id });
    if (id) setActiveSlotId(id);
    else clearActiveSlotId();
  },

  // ── MVU Actions ──

  initStatData: (character, path) => {
    const statData = buildInitialStatData(character, path);
    clearSnapshots();
    saveSnapshot(0, statData);
    set({ statData });
  },

  applyMvuPatches: (patches) => {
    set(state => {
      let newState = applyPatches(state.statData, patches);
      newState = runDerivedEffects(newState);
      return { statData: newState };
    });
  },

  applyBackgroundPatches: (rawPatches) => {
    const s = get();
    // Cùng lớp an toàn như lượt chính: chặn field readonly → gộp trùng → canon guard.
    const safe = filterAIPatches(rawPatches);
    const resolved = resolveEntityPatches(s.statData, safe);
    const { patches, dropped } = guardPatches(s.statData, resolved);
    if (patches.length === 0) return { applied: 0, dropped: dropped.length };
    let ns = applyPatches(s.statData, patches);
    ns = runDerivedEffects(ns);       // KHÔNG tăng _turnCount (đây là diễn biến nền)
    set({ statData: ns });
    const f = get();
    if (f.game.gameStarted) saveToActiveSlot(f.game, f.messages, f.statData);
    return { applied: patches.length, dropped: dropped.length };
  },

  processAIResponse: (rawContent) => {
    const { cleanText, patches: rawPatches, errors } = extractPatches(rawContent);

    if (errors.length > 0) {
      console.warn('[MVU] Patch parse errors:', errors);
    }

    // Chống trùng: gộp "insert" thực thể đã tồn tại vào id cũ thay vì tạo mới.
    const resolved = resolveEntityPatches(get().statData, rawPatches);
    // Canon Guard: chặn thực thể ma & thời gian chạy lùi.
    const { patches, dropped } = guardPatches(get().statData, resolved);
    if (dropped.length > 0) {
      console.warn('[Canon Guard] bỏ', dropped.length, 'patch mâu thuẫn:', dropped.map(d => d.reason));
    }

    if (patches.length > 0) {
      const s = get();
      // Save snapshot BEFORE applying patches
      saveSnapshot(s.statData._turnCount, s.statData);

      // Apply patches
      let newState = applyPatches(s.statData, patches);
      // Increment turn count
      newState = { ...newState, _turnCount: newState._turnCount + 1 };
      // Run derived effects
      newState = runDerivedEffects(newState);

      set({ statData: newState });

      // Update the last assistant message with patch info
      set(state => {
        const msgs = [...state.messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === 'assistant') {
            msgs[i] = {
              ...msgs[i],
              rawContent,
              cleanContent: cleanText,
              content: cleanText,
              patches,
              streaming: false,
            };
            break;
          }
        }
        return {
          messages: msgs,
          game: { ...state.game, turnCount: newState._turnCount },
        };
      });
    }

    // Persist the finalized turn — fix: patches path never saved,
    // so F5 dropped the latest turn's AI response.
    const finalState = get();
    if (finalState.game.gameStarted) {
      saveToActiveSlot(finalState.game, finalState.messages, finalState.statData);
    }

    return { cleanText, patches };
  },

  rollbackToTurn: (turn) => {
    const rolledBack = rollbackTo(turn);
    if (!rolledBack) return false;
    set({
      statData: rolledBack,
      game: { ...get().game, turnCount: turn },
    });
    return true;
  },

  rewindOneTurn: () => {
    const s = get();
    const msgs = [...s.messages];
    // Tìm assistant cuối cùng + user ngay trước nó
    let ai = -1;
    for (let i = msgs.length - 1; i >= 0; i--) { if (msgs[i].role === 'assistant') { ai = i; break; } }
    if (ai < 0) return false;
    let ui = -1;
    for (let i = ai - 1; i >= 0; i--) { if (msgs[i].role === 'user') { ui = i; break; } }
    const cut = ui >= 0 ? ui : ai;
    const newMsgs = msgs.slice(0, cut);
    // Khôi phục state về 1 lượt trước (nếu có snapshot)
    const targetTurn = Math.max(0, s.statData._turnCount - 1);
    const restored = rollbackTo(targetTurn);
    const newStat = restored ?? s.statData;
    set({
      messages: newMsgs,
      statData: newStat,
      game: { ...s.game, turnCount: newStat._turnCount },
    });
    if (s.game.gameStarted) saveToActiveSlot(s.game, newMsgs, newStat);
    return true;
  },

  // ── Persistence ──

  saveToStorage: () => {
    const s = get();
    saveToActiveSlot(s.game, s.messages, s.statData);
  },

  loadFromStorage: (slotId?: string) => {
    const id = slotId || getActiveSlotId();
    if (!id) return false;
    const data = loadFromSlot(id);
    if (!data) return false;
    const updates: Partial<ChatState> = {
      game: data.game,
      messages: data.messages,
      activeSlotId: id,
    };
    if (data.statData) {
      try {
        updates.statData = StatDataSchema.parse(data.statData);
      } catch {
        updates.statData = StatDataSchema.parse({});
      }
    }
    setActiveSlotId(id);
    set(updates as ChatState);
    return true;
  },

  clearSave: () => {
    const slotId = get().activeSlotId;
    if (slotId) deleteSlot(slotId);
    clearSnapshots();
    set({ activeSlotId: null });
  },
}));
