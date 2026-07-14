/* ═══════════════════════════════════════════════════════
   ENTITY REGISTRY — Sổ đăng ký thực thể & chống trùng.
   Engine giữ SỰ THẬT về "ai là ai": mỗi npc/entity có một
   id chính danh + danh sách biệt danh. Khi AI lỡ tạo mới
   một thực thể đã tồn tại (tên khác dấu/khác cách gọi),
   resolver này TỰ GỘP vào id cũ thay vì nhân đôi.
   ═══════════════════════════════════════════════════════ */

import type { StatData } from '../mvu/schema';
import type { MvuPatchOp } from '../mvu/patchEngine';

/** Tiền tố tôn xưng bị lược khi so "tên lõi" (Thần Viêm Đế ≈ Viêm Đế). */
const HONORIFICS = [
  'than', 'thanh', 'dai', 'chua', 'vua', 'lao', 'tieu', 'ngai',
  'duc', 'thuong', 'chan', 'to', 'vi', 'lord', 'god', 'the',
];

/** Chuẩn hóa: bỏ dấu, đ→d, hạ chữ thường, gộp khoảng trắng. */
const DIACRITICS = /[̀-ͯ]/g;

export function normalizeName(s: string): string {
  return (s || '')
    .normalize('NFD').replace(DIACRITICS, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Tên lõi": chuẩn hóa rồi lược các tiền tố tôn xưng ở đầu. */
export function coreName(s: string): string {
  let n = normalizeName(s);
  let changed = true;
  while (changed && n) {
    changed = false;
    for (const h of HONORIFICS) {
      if (n === h) continue;
      if (n.startsWith(h + ' ')) { n = n.slice(h.length + 1).trim(); changed = true; }
    }
  }
  return n;
}

/** Hai tên có trỏ về cùng một thực thể không (theo chuẩn hóa / tên lõi). */
export function sameName(a: string, b: string): boolean {
  const na = normalizeName(a), nb = normalizeName(b);
  if (na && na === nb) return true;
  const ca = coreName(a), cb = coreName(b);
  return !!ca && ca === cb;
}

function memberNames(v: unknown): string[] {
  const names: string[] = [];
  if (v && typeof v === 'object') {
    const o = v as Record<string, unknown>;
    if (typeof o.name === 'string') names.push(o.name);
    if (Array.isArray(o.aliases)) for (const a of o.aliases) if (typeof a === 'string') names.push(a);
  }
  return names;
}

/**
 * Tìm id có sẵn khớp với (aiKey | aiName). Trả null nếu là thực thể mới thật.
 * Ưu tiên: trùng key tuyệt đối → trùng tên chuẩn hóa → trùng tên lõi.
 */
export function findExistingKey(
  record: Record<string, unknown>,
  aiKey: string | undefined,
  aiName: string | undefined,
): string | null {
  if (aiKey && record[aiKey]) return aiKey;

  const targets = [aiName].filter((x): x is string => !!x && x.trim().length > 0);
  if (targets.length === 0) return null;

  for (const [k, v] of Object.entries(record)) {
    const candidates = [...memberNames(v), k];
    for (const cand of candidates) {
      for (const t of targets) {
        if (sameName(cand, t)) return k;
      }
    }
  }
  return null;
}

/** Trường số quan hệ/sức mạnh — KHÔNG tự ghi đè khi gộp (chỉ đổi qua delta). */
const PROTECTED: Record<string, string[]> = {
  npcs: ['affinity', 'loyalty', '_affinityStage'],
  entities: ['power', 'loyalty'],
};

const COLLECTIONS = new Set(['npcs', 'entities']);

function isEmptyVal(v: unknown): boolean {
  return v === undefined || v === null
    || (typeof v === 'string' && v.trim() === '')
    || (Array.isArray(v) && v.length === 0);
}

/**
 * Tiền xử lý patch của AI TRƯỚC khi áp:
 * - insert npcs/entities trỏ về thực thể ĐÃ CÓ → chuyển thành gộp
 *   (chỉ điền field còn trống, nối mảng, đăng ký biệt danh; KHÔNG đè số quan hệ).
 * - insert thực thể MỚI → giữ nguyên, gieo sẵn mảng aliases.
 */
export function resolveEntityPatches(state: StatData, patches: MvuPatchOp[]): MvuPatchOp[] {
  const out: MvuPatchOp[] = [];

  for (const op of patches) {
    const isEntityInsert =
      op.op === 'insert' &&
      COLLECTIONS.has(op.path) &&
      !!op.key &&
      op.value != null && typeof op.value === 'object' && !Array.isArray(op.value);

    if (!isEntityInsert) { out.push(op); continue; }

    const coll = op.path;
    const record = ((state as unknown as Record<string, unknown>)[coll] as Record<string, unknown>) || {};
    const val = op.value as Record<string, unknown>;
    const aiName = typeof val.name === 'string' ? val.name : undefined;
    const existingKey = findExistingKey(record, op.key, aiName);

    if (!existingKey) {
      // Thực thể mới thật → giữ, gieo aliases rỗng nếu thiếu.
      if (!('aliases' in val)) (op.value as Record<string, unknown>).aliases = [];
      out.push(op);
      continue;
    }

    // Gộp vào id đã có.
    const existing = (record[existingKey] as Record<string, unknown>) || {};
    const protectedFields = PROTECTED[coll] || [];

    for (const [k, v] of Object.entries(val)) {
      if (k === 'aliases') continue;
      if (isEmptyVal(v)) continue;

      if (Array.isArray(v)) {
        const cur = Array.isArray(existing[k]) ? (existing[k] as unknown[]) : [];
        for (const item of v) {
          if (!cur.includes(item)) {
            out.push({ op: 'insert', path: `${coll}.${existingKey}.${k}`, value: item });
          }
        }
        continue;
      }
      if (protectedFields.includes(k)) continue;   // không đè số quan hệ
      if (!isEmptyVal(existing[k])) continue;       // chỉ điền chỗ còn trống
      out.push({ op: 'replace', path: `${coll}.${existingKey}.${k}`, value: v });
    }

    // Đăng ký biệt danh: tên AI vừa dùng, nếu chưa biết.
    if (aiName) {
      const known = new Set<string>();
      if (typeof existing.name === 'string') known.add(normalizeName(existing.name));
      if (Array.isArray(existing.aliases)) {
        for (const a of existing.aliases) if (typeof a === 'string') known.add(normalizeName(a));
      }
      const nn = normalizeName(aiName);
      if (nn && !known.has(nn)) {
        out.push({ op: 'insert', path: `${coll}.${existingKey}.aliases`, value: aiName });
      }
    }
  }

  return out;
}
