import { create } from 'zustand';
import type { MortalEntity, MortalCategoryId } from './mortalTypes';

const KEY = 'godsim_mortal';

interface MortalPersist {
  entities: MortalEntity[];
  version: number;
}

function load(): MortalEntity[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as MortalPersist;
    return Array.isArray(data.entities) ? data.entities : [];
  } catch {
    return [];
  }
}

function persist(entities: MortalEntity[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ entities, version: 1 } satisfies MortalPersist));
  } catch { /* quota / blocked */ }
}

interface MortalState {
  entities: MortalEntity[];
  activeCategory: MortalCategoryId;
  editingId: string | null;

  setActiveCategory: (c: MortalCategoryId) => void;
  openEditor: (id: string | null) => void;

  add: (e: MortalEntity) => void;
  update: (id: string, patch: Partial<MortalEntity>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string | null;

  byCategory: (c: MortalCategoryId) => MortalEntity[];
  countByCategory: (c: MortalCategoryId) => number;
  getById: (id: string) => MortalEntity | undefined;
}

export const useMortalStore = create<MortalState>()((set, get) => ({
  entities: load(),
  activeCategory: 'realm',
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
    const copy: MortalEntity = {
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
