/* ═══════════════════════════════════════════════════════
   GOD SYNC — Auto-ghi tạo vật vào Thần Điện
   ═══════════════════════════════════════════════════════ */

import {
  GOD_CATEGORIES, blankGodEntity,
  type GodEntity, type GodCategoryId,
} from '@/components/studio/godTypes';
import { asStr, type FieldValue } from '@/components/studio/studioTypes';

const TAG = /<GodCreate>([\s\S]*?)<\/GodCreate>/gi;
const FENCE = /```(?:json)?\s*([\s\S]*?)```/i;

export interface GodSyncResult {
  text: string;
  entities: GodEntity[];
}

interface RawCreate {
  category?: unknown;
  name?: unknown;
  tagline?: unknown;
  fields?: unknown;
}

function toEntity(obj: RawCreate): GodEntity | null {
  if (!obj || typeof obj !== 'object') return null;
  const catId = String(obj.category ?? '') as GodCategoryId;
  const cat = GOD_CATEGORIES.find(c => c.id === catId);
  if (!cat) return null;

  const e = blankGodEntity(cat);
  if (typeof obj.name === 'string') e.name = obj.name.slice(0, 200);
  if (typeof obj.tagline === 'string') {
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
    }
  }
  return e;
}

export function extractGodCreations(raw: string): GodSyncResult {
  const blocks: string[] = [];
  const text = raw
    .replace(TAG, (_m, inner: string) => { blocks.push(inner.trim()); return ''; })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const entities: GodEntity[] = [];
  for (const b of blocks) {
    let js = b;
    const fence = FENCE.exec(b);
    if (fence) js = fence[1];
    try {
      const parsed = JSON.parse(js);
      const items: RawCreate[] = Array.isArray(parsed) ? parsed : [parsed];
      for (const it of items) {
        const e = toEntity(it);
        if (e && e.name.trim()) entities.push(e);
      }
    } catch {
      // bỏ qua khối lỗi
    }
  }
  return { text, entities };
}

export function summarizeGodForAI(entities: GodEntity[], maxChars = 3800): string {
  if (!entities.length) return '';

  const byCat = new Map<GodCategoryId, GodEntity[]>();
  for (const e of entities) {
    if (!byCat.has(e.category)) byCat.set(e.category, []);
    byCat.get(e.category)!.push(e);
  }

  const lines: string[] = [
    '=== THẦN ĐIỆN — LUẬT CỦA THẦN GIỚI (CHÍNH SỬ) ===',
    '(Đây là SỰ THẬT BẮT BUỘC về tín đồ, đền thờ, và thần khí. Dùng ĐÚNG dữ liệu dưới đây khi kể.)',
  ];

  for (const cat of GOD_CATEGORIES) {
    const list = byCat.get(cat.id);
    if (!list || list.length === 0) continue;
    lines.push(`# ${cat.plural}:`);
    for (const e of list) {
      const tag = asStr(e.values.tagline);
      const meta = Object.keys(e.values).filter(k => k !== 'tagline').map(k => asStr(e.values[k])).filter(Boolean).slice(0, 2).join(', ');
      const bits = [`- ${e.name || 'Vô Danh'}`];
      if (meta) bits.push(`[${meta}]`);
      if (tag) bits.push(`— ${tag}`);
      lines.push(bits.join(' '));
    }
  }

  let out = lines.join('\n');
  if (out.length > maxChars) out = out.slice(0, maxChars) + '\n…(và nhiều hơn nữa)';
  return out;
}
