/* ═══════════════════════════════════════════════════════
   MORTAL SYNC — Auto-ghi tạo vật vào Động Phủ
   ═══════════════════════════════════════════════════════ */

import {
  MORTAL_CATEGORIES, blankMortalEntity,
  type MortalEntity, type MortalCategoryId,
} from '@/components/studio/mortalTypes';
import { asStr, type FieldValue } from '@/components/studio/studioTypes';

const TAG = /<MortalCreate>([\s\S]*?)<\/MortalCreate>/gi;
const FENCE = /```(?:json)?\s*([\s\S]*?)```/i;

export interface MortalSyncResult {
  text: string;
  entities: MortalEntity[];
}

interface RawCreate {
  category?: unknown;
  name?: unknown;
  tagline?: unknown;
  fields?: unknown;
}

function toEntity(obj: RawCreate): MortalEntity | null {
  if (!obj || typeof obj !== 'object') return null;
  const catId = String(obj.category ?? '') as MortalCategoryId;
  const cat = MORTAL_CATEGORIES.find(c => c.id === catId);
  if (!cat) return null;

  const e = blankMortalEntity(cat);
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

export function extractMortalCreations(raw: string): MortalSyncResult {
  const blocks: string[] = [];
  const text = raw
    .replace(TAG, (_m, inner: string) => { blocks.push(inner.trim()); return ''; })
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const entities: MortalEntity[] = [];
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

export function summarizeMortalForAI(entities: MortalEntity[], maxChars = 3800): string {
  if (!entities.length) return '';

  const byCat = new Map<MortalCategoryId, MortalEntity[]>();
  for (const e of entities) {
    if (!byCat.has(e.category)) byCat.set(e.category, []);
    byCat.get(e.category)!.push(e);
  }

  const lines: string[] = [
    '=== ĐỘNG PHỦ / HÀNH TRANG — LỊCH SỬ TU LUYỆN (CHÍNH SỬ) ===',
    '(Đây là SỰ THẬT BẮT BUỘC về hành trình của phàm nhân. Dùng ĐÚNG pháp bảo, cảnh giới và công pháp dưới đây khi kể.)',
  ];

  for (const cat of MORTAL_CATEGORIES) {
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
