import { create } from 'zustand';
import type { GodEntity, GodCategoryId } from './godTypes';

const KEY = 'godsim_god';

interface GodPersist {
  entities: GodEntity[];
  version: number;
}

function load(): GodEntity[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw) as GodPersist;
    return Array.isArray(data.entities) ? data.entities : [];
  } catch {
    return [];
  }
}

function persist(entities: GodEntity[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ entities, version: 1 } satisfies GodPersist));
  } catch { /* quota / blocked */ }
}

interface GodState {
  entities: GodEntity[];
  activeCategory: GodCategoryId;
  editingId: string | null;

  setActiveCategory: (c: GodCategoryId) => void;
  openEditor: (id: string | null) => void;

  add: (e: GodEntity) => void;
  update: (id: string, patch: Partial<GodEntity>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => string | null;

  byCategory: (c: GodCategoryId) => GodEntity[];
  countByCategory: (c: GodCategoryId) => number;
  getById: (id: string) => GodEntity | undefined;
}

export const useGodStore = create<GodState>()((set, get) => ({
  entities: load(),
  activeCategory: 'follower',
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
    const copy: GodEntity = {
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
