import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/* ═══════════════════════════════════════════════════════
   LOREBOOK STORE — World Info kiểu SillyTavern
   Lưu entries (tương thích format ST) + cấu hình + runtime
   cho sticky/cooldown/delay. Engine kích hoạt ở lorebookEngine.
   ═══════════════════════════════════════════════════════ */

/** selectiveLogic (khớp SillyTavern) */
export const LOGIC = { AND_ANY: 0, NOT_ALL: 1, NOT_ANY: 2, AND_ALL: 3 } as const;

/** position: 0 trước char · 1 sau char · 2 đầu AN · 3 cuối AN · 4 @depth */
export interface LoreEntry {
  uid: number;
  key: string[];
  keysecondary: string[];
  comment: string;          // tiêu đề / memo
  content: string;
  constant: boolean;        // "đèn xanh" — luôn bật
  selective: boolean;       // dùng keysecondary + logic
  selectiveLogic: number;
  order: number;            // càng cao càng ưu tiên (chèn sau)
  position: number;
  role: number | null;      // 0 system · 1 user · 2 assistant (cho @depth)
  depth: number;
  disable: boolean;
  ignoreBudget: boolean;
  excludeRecursion: boolean;    // không bị kích hoạt BỞI đệ quy (chặn đầu vào)
  preventRecursion: boolean;    // không quét nội dung nó để đệ quy tiếp (chặn đầu ra)
  delayUntilRecursion: boolean;
  probability: number;          // 0..100
  useProbability: boolean;
  caseSensitive: boolean | null;
  matchWholeWords: boolean | null;
  sticky: number;
  cooldown: number;
  delay: number;
  scanDepth: number | null;
  group: string;
  groupWeight: number;
  vectorized: boolean;
}

export interface LoreRuntime {
  stickyUntil?: number;   // turn tới khi hết dính
  cooldownUntil?: number; // turn tới khi hết hồi
  delaySeenTurn?: number; // turn lần đầu thấy key (cho delay)
}

export interface LoreSettings {
  enabled: boolean;        // bật inject world info
  autoUpdate: boolean;     // gọi AI cuối lượt để tạo/bổ sung/xóa
  scanDepth: number;       // số tin nhắn gần nhất để quét key
  budgetChars: number;     // ngân sách ký tự cho world info được chèn
  maxRecursion: number;    // số vòng đệ quy tối đa
  recursion: boolean;      // bật đệ quy
  caseSensitive: boolean;  // mặc định toàn cục
  matchWholeWords: boolean;// mặc định toàn cục
}

const DEFAULT_SETTINGS: LoreSettings = {
  enabled: true,
  autoUpdate: false,
  scanDepth: 4,
  budgetChars: 4000,
  maxRecursion: 3,
  recursion: true,
  caseSensitive: false,
  matchWholeWords: true,
};

export function blankEntry(uid: number): LoreEntry {
  return {
    uid,
    key: [], keysecondary: [], comment: '', content: '',
    constant: false, selective: true, selectiveLogic: LOGIC.AND_ANY,
    order: 100, position: 0, role: null, depth: 4,
    disable: false, ignoreBudget: false,
    excludeRecursion: false, preventRecursion: false, delayUntilRecursion: false,
    probability: 100, useProbability: true,
    caseSensitive: null, matchWholeWords: null,
    sticky: 0, cooldown: 0, delay: 0, scanDepth: null,
    group: '', groupWeight: 100, vectorized: false,
  };
}

/** Chuẩn hóa một entry thô (từ import) về LoreEntry đầy đủ */
function normalizeEntry(raw: any, fallbackUid: number): LoreEntry {
  const b = blankEntry(typeof raw?.uid === 'number' ? raw.uid : fallbackUid);
  const arr = (v: any): string[] => Array.isArray(v) ? v.filter((x: any) => typeof x === 'string' && x.trim()) : [];
  return {
    ...b,
    uid: b.uid,
    key: arr(raw.key ?? raw.keys),
    keysecondary: arr(raw.keysecondary),
    comment: String(raw.comment ?? raw.name ?? '').slice(0, 300),
    content: String(raw.content ?? '').slice(0, 20000),
    constant: !!raw.constant,
    selective: raw.selective !== false,
    selectiveLogic: typeof raw.selectiveLogic === 'number' ? raw.selectiveLogic : 0,
    order: typeof raw.order === 'number' ? raw.order : (typeof raw.insertion_order === 'number' ? raw.insertion_order : 100),
    position: typeof raw.position === 'number' ? raw.position : 0,
    role: typeof raw.role === 'number' ? raw.role : null,
    depth: typeof raw.depth === 'number' ? raw.depth : 4,
    disable: !!(raw.disable ?? raw.disabled ?? (raw.enabled === false)),
    ignoreBudget: !!raw.ignoreBudget,
    excludeRecursion: !!raw.excludeRecursion,
    preventRecursion: !!raw.preventRecursion,
    delayUntilRecursion: !!raw.delayUntilRecursion,
    probability: typeof raw.probability === 'number' ? raw.probability : 100,
    useProbability: raw.useProbability !== false,
    caseSensitive: typeof raw.caseSensitive === 'boolean' ? raw.caseSensitive : null,
    matchWholeWords: typeof raw.matchWholeWords === 'boolean' ? raw.matchWholeWords : null,
    sticky: typeof raw.sticky === 'number' ? raw.sticky : 0,
    cooldown: typeof raw.cooldown === 'number' ? raw.cooldown : 0,
    delay: typeof raw.delay === 'number' ? raw.delay : 0,
    scanDepth: typeof raw.scanDepth === 'number' ? raw.scanDepth : null,
    group: String(raw.group ?? ''),
    groupWeight: typeof raw.groupWeight === 'number' ? raw.groupWeight : 100,
    vectorized: !!raw.vectorized,
  };
}

/** Nhận diện & trích entries từ nhiều format (ST world info, character_book V2/V3) */
export function parseLorebookImport(data: any): LoreEntry[] {
  let rawEntries: any[] = [];
  const src = data?.entries ?? data?.character_book?.entries ?? data?.data?.character_book?.entries ?? data;
  if (Array.isArray(src)) {
    rawEntries = src;
  } else if (src && typeof src === 'object') {
    rawEntries = Object.values(src);
  }
  return rawEntries
    .filter(e => e && typeof e === 'object')
    .map((e, i) => normalizeEntry(e, i));
}

interface LorebookState {
  entries: LoreEntry[];
  settings: LoreSettings;
  runtime: Record<number, LoreRuntime>;
  status: 'idle' | 'running' | 'done' | 'error';
  statusMessage: string;

  // CRUD
  addEntry: () => number;                 // trả về uid mới
  updateEntry: (uid: number, patch: Partial<LoreEntry>) => void;
  removeEntry: (uid: number) => void;
  importEntries: (list: LoreEntry[], mode: 'replace' | 'merge') => void;
  clearAll: () => void;

  // Settings & runtime
  setSettings: (patch: Partial<LoreSettings>) => void;
  setRuntime: (uid: number, rt: LoreRuntime) => void;
  setStatus: (status: LorebookState['status'], message?: string) => void;
  nextUid: () => number;
}

export const useLorebookStore = create<LorebookState>()(
  persist(
    (set, get) => ({
      entries: [],
      settings: { ...DEFAULT_SETTINGS },
      runtime: {},
      status: 'idle',
      statusMessage: '',

      nextUid: () => {
        const max = get().entries.reduce((m, e) => Math.max(m, e.uid), -1);
        return max + 1;
      },

      addEntry: () => {
        const uid = get().nextUid();
        set(s => ({ entries: [blankEntry(uid), ...s.entries] }));
        return uid;
      },

      updateEntry: (uid, patch) => set(s => ({
        entries: s.entries.map(e => e.uid === uid ? { ...e, ...patch } : e),
      })),

      removeEntry: (uid) => set(s => {
        const rt = { ...s.runtime }; delete rt[uid];
        return { entries: s.entries.filter(e => e.uid !== uid), runtime: rt };
      }),

      importEntries: (list, mode) => set(s => {
        if (mode === 'replace') return { entries: list, runtime: {} };
        // merge: dời uid để không trùng
        let base = s.entries.reduce((m, e) => Math.max(m, e.uid), -1) + 1;
        const shifted = list.map(e => ({ ...e, uid: base++ }));
        return { entries: [...s.entries, ...shifted] };
      }),

      clearAll: () => set({ entries: [], runtime: {} }),

      setSettings: (patch) => set(s => ({ settings: { ...s.settings, ...patch } })),
      setRuntime: (uid, rt) => set(s => ({ runtime: { ...s.runtime, [uid]: rt } })),
      setStatus: (status, message = '') => set({ status, statusMessage: message }),
    }),
    {
      name: 'godsim-lorebook',
      partialize: (s) => ({ entries: s.entries, settings: s.settings, runtime: s.runtime }),
    }
  )
);
