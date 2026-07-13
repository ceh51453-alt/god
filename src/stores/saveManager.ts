import type { GamePath } from '@/components/creation/creationData';
import type { ChatMessage, GameState } from './chatStore';
import type { StatData } from '@/engine/mvu/schema';

/* ═══════════════════════════════════════════════════════
   SAVE MANAGER — Multi-slot persistence layer
   ═══════════════════════════════════════════════════════ */

export interface SaveMeta {
  slotId: string;
  name: string;
  path: GamePath;
  turnCount: number;
  createdAt: number;
  updatedAt: number;
}

export interface SaveData {
  game: GameState;
  messages: ChatMessage[];
  statData: StatData;
  snapshots?: unknown;
  version: number;
}

const INDEX_KEY = 'godsim_saves_index';
const SLOT_PREFIX = 'godsim_save_';
const ACTIVE_SLOT_KEY = 'godsim_active_slot';
const LEGACY_KEY = 'godsim_save';

/* ── Index CRUD ── */

export function listSaves(): SaveMeta[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(saves: SaveMeta[]) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(saves));
}

/* ── Slot CRUD ── */

export function createSlot(name: string, path: GamePath): string {
  const slotId = crypto.randomUUID();
  const now = Date.now();
  const meta: SaveMeta = {
    slotId,
    name,
    path,
    turnCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const saves = listSaves();
  saves.unshift(meta); // newest first
  writeIndex(saves);
  return slotId;
}

export function saveSlot(slotId: string, data: SaveData) {
  try {
    const serialized = JSON.stringify({
      ...data,
      messages: data.messages.filter(m => !m.streaming).slice(-200),
    });
    localStorage.setItem(SLOT_PREFIX + slotId, serialized);

    // Update meta
    const saves = listSaves();
    const idx = saves.findIndex(s => s.slotId === slotId);
    if (idx >= 0) {
      saves[idx].updatedAt = Date.now();
      saves[idx].turnCount = data.game.turnCount;
      saves[idx].name = data.game.godName || saves[idx].name;
      writeIndex(saves);
    }
  } catch { /* quota exceeded */ }
}

export function loadSlot(slotId: string): SaveData | null {
  try {
    const raw = localStorage.getItem(SLOT_PREFIX + slotId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.game?.gameStarted) return null;
    return data;
  } catch {
    return null;
  }
}

export function deleteSlot(slotId: string) {
  localStorage.removeItem(SLOT_PREFIX + slotId);
  const saves = listSaves().filter(s => s.slotId !== slotId);
  writeIndex(saves);

  // If deleted slot was active, clear active
  if (getActiveSlotId() === slotId) {
    clearActiveSlotId();
  }
}

/* ── Active Slot Tracking ── */

export function getActiveSlotId(): string | null {
  return localStorage.getItem(ACTIVE_SLOT_KEY);
}

export function setActiveSlotId(id: string) {
  localStorage.setItem(ACTIVE_SLOT_KEY, id);
}

export function clearActiveSlotId() {
  localStorage.removeItem(ACTIVE_SLOT_KEY);
}

/* ── Migration from legacy single-save ── */

export function migrateLegacySave(): string | null {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return null;

    // Already migrated?
    if (listSaves().length > 0) {
      // Legacy key exists but we already have slots — just clean up
      localStorage.removeItem(LEGACY_KEY);
      return null;
    }

    const data = JSON.parse(raw);
    if (!data?.game?.gameStarted) {
      localStorage.removeItem(LEGACY_KEY);
      return null;
    }

    // Create a new slot from legacy data
    const slotId = createSlot(
      data.game.godName || 'Unnamed',
      data.game.path || 'creator',
    );

    // Write the data to the new slot key
    localStorage.setItem(SLOT_PREFIX + slotId, raw);

    // Update meta with real turn count
    const saves = listSaves();
    const idx = saves.findIndex(s => s.slotId === slotId);
    if (idx >= 0) {
      saves[idx].turnCount = data.game.turnCount || 0;
      saves[idx].updatedAt = Date.now();
      writeIndex(saves);
    }

    // Set as active and clean up legacy
    setActiveSlotId(slotId);
    localStorage.removeItem(LEGACY_KEY);

    return slotId;
  } catch {
    localStorage.removeItem(LEGACY_KEY);
    return null;
  }
}
