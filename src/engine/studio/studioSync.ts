/* ═══════════════════════════════════════════════════════
   STUDIO SYNC — Auto-ghi tạo vật vào Xưởng Sáng Thế
   AI phát <StudioCreate>{json}</StudioCreate> trong lúc chơi
   → parse an toàn → thành StudioEntity → thêm vào studioStore.
   ═══════════════════════════════════════════════════════ */

import {
  CATEGORIES, blankEntity, asStr,
  type StudioEntity, type CategoryId, type FieldValue,
} from '@/components/studio/studioTypes';

const TAG = /<StudioCreate>([\s\S]*?)<\/StudioCreate>/gi;
const FENCE = /```(?:json)?\s*([\s\S]*?)```/i;

export interface StudioSyncResult {
  /** Text đã gỡ bỏ các khối <StudioCreate> */
  text: string;
  creations: StudioEntity[];
}

interface RawCreate {
  category?: unknown;
  name?: unknown;
  tagline?: unknown;
  fields?: unknown;
}

function toEntity(obj: RawCreate): StudioEntity | null {
  if (!obj || typeof obj !== 'object') return null;
  const catId = String(obj.category ?? '') as CategoryId;
  const cat = CATEGORIES.find(c => c.id === catId);
  if (!cat) return null;

  const e = blankEntity(cat);
  if (typeof obj.name === 'string') e.name = obj.name.slice(0, 200);
  if (typeof obj.tagline === 'string' && 'tagline' in e.values) {
    e.values.tagline = obj.tagline.slice(0, 500);
  }

  const fields = (obj.fields && typeof obj.fields === 'object' ? obj.fields : {}) as Record<string, unknown>;
  for (const f of cat.fields) {
    if (!(f.id in fields)) continue;
    const v = fields[f.id];
    switch (f.type) {
      case 'text':
      case 'textarea':
      case 'select':
        if (typeof v === 'string') e.values[f.id] = v.slice(0, 1000);
        break;
      case 'tags':
        if (Array.isArray(v)) {
          e.values[f.id] = v.filter((x): x is string => typeof x === 'string').slice(0, 20) as FieldValue;
        }
        break;
      case 'stats':
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          const cur = { ...(e.values[f.id] as Record<string, number>) };
          for (const [k, n] of Object.entries(v as Record<string, unknown>)) {
            if (typeof n === 'number' && k in cur) cur[k] = n;
          }
          e.values[f.id] = cur;
        }
        break;
      // graph / sublist / relations: bỏ qua (phụ thuộc id/cấu trúc, để người chơi tự dựng)
    }
  }
  return e;
}

export function extractStudioCreations(raw: string): StudioSyncResult {
  const blocks: string[] = [];
  const text = raw
    .replace(TAG, (_m, inner: string) => { blocks.push(inner.trim()); return ''; })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const creations: StudioEntity[] = [];
  for (const b of blocks) {
    let js = b;
    const fence = FENCE.exec(b);
    if (fence) js = fence[1];
    try {
      const parsed = JSON.parse(js);
      const items: RawCreate[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of items) {
        const e = toEntity(it);
        if (e && e.name.trim()) creations.push(e);
      }
    } catch {
      /* bỏ qua khối lỗi */
    }
  }
  return { text, creations };
}

/* ═══════════════════════════════════════════════════════
   Tóm tắt Xưởng cho AI — để AI "biết" thế giới đã dựng
   ═══════════════════════════════════════════════════════ */

/** Vài trường cốt lõi hiển thị kèm mỗi thực thể, theo phân hệ */
const KEY_FIELDS: Record<CategoryId, string[]> = {
  world: ['type', 'scale'],
  law: ['domain', 'scope'],
  material: ['class', 'rarity'],
  power: ['paradigm', 'energy'],
  species: ['basis', 'kingdom'],
  artifact: ['type', 'scale', 'rarity'],
  faith: ['type', 'morality'],
  deity: ['rank', 'moral'],
  cosmic_event: ['era'],
  divine_hierarchy: ['roles'],
};

/** Field graph (cây/chuỗi) cốt lõi cần đưa cho AI — đây là "luật" người chơi tự dựng. */
const GRAPH_FIELDS: Partial<Record<CategoryId, { field: string; label: string }>> = {
  power: { field: 'tiers', label: 'Thang cảnh giới (BẮT BUỘC theo đúng thứ tự & tên này)' },
  law: { field: 'clauses', label: 'Điều khoản' },
  world: { field: 'planes', label: 'Tầng/cõi' },
  material: { field: 'refine', label: 'Chuỗi tinh luyện' },
  species: { field: 'evolution', label: 'Hướng tiến hóa' },
  artifact: { field: 'awaken', label: 'Chuỗi thăng cấp' },
};

/** Render các node của một field graph thành các dòng thụt lề cho prompt. */
function renderGraphNodes(raw: unknown, label: string, max = 10): string[] {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const out: string[] = [`  ${label}:`];
  raw.slice(0, max).forEach((n, i) => {
    if (!n || typeof n !== 'object') return;
    const o = n as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title.trim() : '';
    if (!title) return;
    const meta = typeof o.meta === 'string' ? o.meta.trim() : '';
    const detail = typeof o.detail === 'string' ? o.detail.trim() : '';
    let line = `    ${i + 1}. ${title}`;
    if (typeof o.num === 'number') line += ` ·${o.num}`;
    if (meta) line += ` [${meta}]`;
    if (detail) line += ` — ${detail}`;
    out.push(line);
  });
  return out.length > 1 ? out : [];
}

export function summarizeStudioForAI(entities: StudioEntity[], maxChars = 3800): string {
  if (!entities.length) return '';

  const byCat = new Map<CategoryId, StudioEntity[]>();
  for (const e of entities) {
    if (!byCat.has(e.category)) byCat.set(e.category, []);
    byCat.get(e.category)!.push(e);
  }

  const lines: string[] = [
    '=== XƯỞNG SÁNG THẾ — LUẬT & THẾ GIỚI NGƯƠI ĐÃ DỰNG (CHÍNH SỬ) ===',
    '(Đây là SỰ THẬT BẮT BUỘC về vũ trụ. Dùng ĐÚNG tên, thang cảnh giới, điều khoản luật dưới đây khi kể.',
    'Ngươi được mở rộng chi tiết nhưng TUYỆT ĐỐI KHÔNG bịa cảnh giới/quy luật khác hay mâu thuẫn với chúng.)',
  ];

  for (const cat of CATEGORIES) {
    const list = byCat.get(cat.id);
    if (!list || list.length === 0) continue;
    lines.push(`# ${cat.plural}:`);
    for (const e of list) {
      const tag = asStr(e.values.tagline);
      const meta = KEY_FIELDS[cat.id]
        .map(id => asStr(e.values[id]))
        .filter(Boolean)
        .join(', ');
      const bits = [`- ${e.name || 'Vô Danh'}`];
      if (meta) bits.push(`[${meta}]`);
      if (tag) bits.push(`— ${tag}`);
      lines.push(bits.join(' '));

      // Đưa "luật" người chơi tự dựng (thang cảnh giới, điều khoản, cây tiến hóa...) vào prompt.
      const g = GRAPH_FIELDS[cat.id];
      if (g) {
        for (const l of renderGraphNodes(e.values[g.field], g.label)) lines.push(l);
      }
    }
  }

  let out = lines.join('\n');
  if (out.length > maxChars) out = out.slice(0, maxChars) + '\n…(và nhiều hơn nữa)';
  return out;
}
