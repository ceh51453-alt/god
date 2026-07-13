/* ═══════════════════════════════════════════════════════
   STUDIO SYNC — Auto-ghi tạo vật vào Xưởng Sáng Thế
   AI phát <StudioCreate>{json}</StudioCreate> trong lúc chơi
   → parse an toàn → thành StudioEntity → thêm vào studioStore.
   ═══════════════════════════════════════════════════════ */

import {
  CATEGORIES, blankEntity,
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
