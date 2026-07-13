import { create } from 'zustand';
import type { StudioEntity, CategoryId } from './studioTypes';

/* ═══════════════════════════════════════════════════════
   STUDIO STORE — kho tạo vật của Xưởng Sáng Thế
   Lưu riêng ('godsim_studio'), độc lập với save game.
   ═══════════════════════════════════════════════════════ */

const KEY = 'godsim_studio';

interface StudioPersist {
  entities: StudioEntity[];
  version: number;
}

function load(): StudioEntity[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as StudioPersist;
    return Array.isArray(data.entities) ? data.entities : [];
  } catch {
    return [];
  }
}

function persist(entities: StudioEntity[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ entities, version: 1 } satisfies StudioPersist));
  } catch { /* quota / blocked */ }
}

interface StudioState {
  entities: StudioEntity[];
  activeCategory: CategoryId;
  editingId: string | null;   // id đang mở editor (entity mới đã được add trước khi mở)

  setActiveCategory: (c: CategoryId) => void;
  openEditor: (id: string | null) => void;

  add: (e: StudioEntity) => void;
  update: (id: string, patch: Partial<StudioEntity>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string | null;

  byCategory: (c: CategoryId) => StudioEntity[];
  countByCategory: (c: CategoryId) => number;
  getById: (id: string) => StudioEntity | undefined;
}

export const useStudioStore = create<StudioState>()((set, get) => ({
  entities: load(),
  activeCategory: 'world',
  editingId: null,

  setActiveCategory: (c) => set({ activeCategory: c }),
  openEditor: (id) => set({ editingId: id }),

  add: (e) => {
    const entities = [e, ...get().entities];
    persist(entities);
    set({ entities });
  },

  update: (id, patch) => {
    const entities = get().entities.map(e =>
      e.id === id ? { ...e, ...patch, updatedAt: Date.now() } : e
    );
    persist(entities);
    set({ entities });
  },

  remove: (id) => {
    const entities = get().entities.filter(e => e.id !== id);
    persist(entities);
    set({ entities, editingId: get().editingId === id ? null : get().editingId });
  },

  duplicate: (id) => {
    const src = get().entities.find(e => e.id === id);
    if (!src) return null;
    const copy: StudioEntity = {
      ...src,
      id: crypto.randomUUID(),
      name: `${src.name || 'Vô Danh'} (Bản Sao)`,
      values: structuredClone(src.values),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const entities = [copy, ...get().entities];
    persist(entities);
    set({ entities });
    return copy.id;
  },

  byCategory: (c) => get().entities.filter(e => e.category === c),
  countByCategory: (c) => get().entities.reduce((n, e) => n + (e.category === c ? 1 : 0), 0),
  getById: (id) => get().entities.find(e => e.id === id),
}));
