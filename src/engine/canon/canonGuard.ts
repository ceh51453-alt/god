/* ═══════════════════════════════════════════════════════
   CANON GUARD — Chặn mâu thuẫn TẤT ĐỊNH ngay tại patch,
   trước khi áp vào state. Không cần AI, không tốn API.
   Bắt các lỗi hay gặp của AI:
   - Ghi vào npcs/entities/quests.<id> KHÔNG tồn tại → tạo
     thực thể rỗng/ma (một dạng "tự nhiên biết / bịa ra").
   - Cho thời gian chạy lùi (delta âm / replace nhỏ hơn hiện tại).
   Chạy SAU resolveEntityPatches, TRƯỚC applyPatches.
   ═══════════════════════════════════════════════════════ */

import type { StatData } from '../mvu/schema';
import type { MvuPatchOp } from '../mvu/patchEngine';

const RECORD_COLLS = ['npcs', 'entities', 'quests'];
const TIME_FIELDS = new Set(['day', 'season', 'year', 'epoch']);

export interface GuardResult {
  patches: MvuPatchOp[];
  dropped: { op: MvuPatchOp; reason: string }[];
}

function opPath(op: MvuPatchOp): string {
  return 'path' in op ? op.path : '';
}

export function guardPatches(state: StatData, patches: MvuPatchOp[]): GuardResult {
  const dropped: { op: MvuPatchOp; reason: string }[] = [];
  const kept: MvuPatchOp[] = [];

  // id đã biết cho mỗi collection = đang tồn tại ∪ vừa insert trong CHÍNH batch này.
  const S = state as unknown as Record<string, Record<string, unknown>>;
  const known: Record<string, Set<string>> = {};
  for (const c of RECORD_COLLS) known[c] = new Set(Object.keys(S[c] || {}));

  const time = (state.world?.time ?? {}) as unknown as Record<string, number>;

  for (const op of patches) {
    // 1) insert cả một bản ghi mới → đăng ký id, luôn giữ.
    if (op.op === 'insert' && RECORD_COLLS.includes(op.path) && op.key) {
      known[op.path].add(op.key);
      kept.push(op);
      continue;
    }

    const path = opPath(op);

    // 2) Chống thực thể ma: mọi op (kể cả insert lồng sâu, vd
    //    insert npcs.<id>.knows hoặc insert npcs.<id> + key) vào <coll>.<id>
    //    mà id chưa tồn tại — insert lồng vẫn tạo được bản ghi ma sai shape.
    const m = /^(npcs|entities|quests)\.([^.]+)(?:\.|$)/.exec(path);
    if (m && (op.op === 'replace' || op.op === 'delta' || op.op === 'remove' || op.op === 'insert')) {
      const coll = m[1], id = m[2];
      if (!known[coll].has(id)) {
        dropped.push({ op, reason: `bỏ ${op.op} "${path}" — id "${id}" chưa tồn tại (tránh tạo thực thể rỗng). Muốn thêm mới thì dùng insert.` });
        continue;
      }
    }

    // 3) Chống thời gian chạy lùi.
    const tm = /^world\.time\.([^.]+)$/.exec(path);
    if (tm && TIME_FIELDS.has(tm[1])) {
      const field = tm[1];
      if (op.op === 'delta' && typeof op.value === 'number' && op.value < 0) {
        dropped.push({ op, reason: `bỏ delta âm vào world.time.${field} — thời gian không được chạy lùi.` });
        continue;
      }
      if (op.op === 'replace' && typeof op.value === 'number' && op.value < (time[field] ?? 0)) {
        dropped.push({ op, reason: `bỏ replace world.time.${field}=${op.value} — nhỏ hơn hiện tại (${time[field]}), sẽ khiến thời gian lùi.` });
        continue;
      }
    }

    kept.push(op);
  }

  return { patches: kept, dropped };
}
