import { create } from 'zustand';
import type { GamePath, CharacterData } from '@/components/creation/creationData';
import { defaultCharacter } from '@/components/creation/creationData';
import type { StatData } from '@/engine/mvu/schema';
import { StatDataSchema } from '@/engine/mvu/schema';
import type { MvuPatchOp } from '@/engine/mvu/patchEngine';
import { applyPatches } from '@/engine/mvu/patchEngine';
import { deriveAffinityStage } from '@/engine/mvu/schema';
import { saveSnapshot, clearSnapshots, rollbackTo, exportSnapshots, importSnapshots } from '@/engine/mvu/snapshot';
import { extractPatches } from '@/engine/mvu/extractor';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  rawContent?: string;        // Original AI response (before tag stripping)
  cleanContent?: string;      // Narrative text (after tag stripping)
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
  retryingAttempt: number | null;
  retryingMax: number | null;

  game: GameState;

  /** MVU State — single source of truth */
  statData: StatData;

  showSettings: boolean;
  activeView: ViewId;
  showStatusPanel: boolean;

  /** Lệnh sáng tạo từ Xưởng Sáng Thế, chờ ChatPanel gửi cho AI */
  pendingDecree: string | null;

  // Actions
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean, text?: string) => void;
  appendStreamText: (chunk: string) => void;
  setRetrying: (attempt: number | null, max?: number | null) => void;
  clearMessages: () => void;

  setGame: (updates: Partial<GameState>) => void;
  setShowSettings: (show: boolean) => void;
  setActiveView: (view: ViewId) => void;
  setShowStatusPanel: (show: boolean) => void;
  setPendingDecree: (text: string | null) => void;

  // MVU Actions
  initStatData: (character: CharacterData, path: GamePath) => void;
  applyMvuPatches: (patches: MvuPatchOp[]) => void;
  processAIResponse: (rawContent: string) => { cleanText: string; patches: MvuPatchOp[] };
  rollbackToTurn: (turn: number) => boolean;

  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => boolean;
  clearSave: () => void;
}

const SAVE_KEY = 'godsim_save';

function saveToLS(game: GameState, messages: ChatMessage[], statData: StatData) {
  try {
    const data = {
      game,
      messages: messages.filter(m => !m.streaming).slice(-200), // Keep last 200
      statData,
      snapshots: exportSnapshots(),
      version: 2,
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch { /* quota exceeded or blocked */ }
}

function loadFromLS(): { game: GameState; messages: ChatMessage[]; statData?: StatData } | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.game?.gameStarted) return null;
    // Import snapshots if present
    if (data.snapshots) {
      importSnapshots(data.snapshots);
    }
    return data;
  } catch { return null; }
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
  const result = { ...state };

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

  return result;
}

export const useChatStore = create<ChatState>()((set, get) => ({
  messages: [],
  isStreaming: false,
  streamingText: '',
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
      if (s.game.gameStarted) saveToLS(s.game, s.messages, s.statData);
    }, 100);
  },

  updateLastAssistantMessage: (content) => set(state => {
    const msgs = [...state.messages];
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') {
        msgs[i] = { ...msgs[i], content, streaming: false };
        break;
      }
    }
    return { messages: msgs };
  }),

  setStreaming: (streaming, text = '') => set({
    isStreaming: streaming,
    streamingText: streaming ? text : '',
  }),

  appendStreamText: (chunk) => set(state => ({
    streamingText: state.streamingText + chunk,
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
      if (s.game.gameStarted) saveToLS(s.game, s.messages, s.statData);
    }, 100);
  },

  setShowSettings: (show) => set({ showSettings: show }),
  setActiveView: (view) => set({ activeView: view }),
  setShowStatusPanel: (show) => set({ showStatusPanel: show }),
  setPendingDecree: (text) => set({ pendingDecree: text }),

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

  processAIResponse: (rawContent) => {
    const { cleanText, patches, errors } = extractPatches(rawContent);

    if (errors.length > 0) {
      console.warn('[MVU] Patch parse errors:', errors);
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

  // ── Persistence ──

  saveToStorage: () => {
    const s = get();
    saveToLS(s.game, s.messages, s.statData);
  },

  loadFromStorage: () => {
    const data = loadFromLS();
    if (!data) return false;
    const updates: Partial<ChatState> = {
      game: data.game,
      messages: data.messages,
    };
    if (data.statData) {
      try {
        updates.statData = StatDataSchema.parse(data.statData);
      } catch {
        // Migration: parse what we can, fill defaults
        updates.statData = StatDataSchema.parse({});
      }
    }
    set(updates as ChatState);
    return true;
  },

  clearSave: () => {
    localStorage.removeItem(SAVE_KEY);
    clearSnapshots();
  },
}));
