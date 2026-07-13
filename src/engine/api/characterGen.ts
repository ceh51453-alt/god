/* ═══════════════════════════════════════════════════════
   AI CHARACTER GENERATOR
   Nhập yêu cầu/mô tả → AI trả JSON → điền hồ sơ nhân vật.
   ═══════════════════════════════════════════════════════ */

import { sendChat } from './apiClient';
import { useConnectionStore } from '@/stores/connectionStore';
import type { GamePath, CharacterData, AttributeDef, TraitDef } from '@/components/creation/creationData';
import {
  CREATOR_ATTRIBUTES, GOD_ATTRIBUTES, MORTAL_ATTRIBUTES,
  CREATOR_TRAITS, GOD_TRAITS, MORTAL_TRAITS,
  CREATOR_REPUTATIONS, GOD_REPUTATIONS, MORTAL_REPUTATIONS,
  CREATOR_CRISES, GOD_CRISES, MORTAL_CRISES,
} from '@/components/creation/creationData';

function lists(path: GamePath) {
  const attrs: AttributeDef[] = path === 'creator' ? CREATOR_ATTRIBUTES : path === 'god' ? GOD_ATTRIBUTES : MORTAL_ATTRIBUTES;
  const traits: TraitDef[] = path === 'creator' ? CREATOR_TRAITS : path === 'god' ? GOD_TRAITS : MORTAL_TRAITS;
  const reps = path === 'creator' ? CREATOR_REPUTATIONS : path === 'god' ? GOD_REPUTATIONS : MORTAL_REPUTATIONS;
  const crises = path === 'creator' ? CREATOR_CRISES : path === 'god' ? GOD_CRISES : MORTAL_CRISES;
  return { attrs, traits, reps, crises };
}

/** Đã cấu hình kết nối AI chưa? */
export function hasConnection(): boolean {
  const p = useConnectionStore.getState().getActiveProfile();
  return Boolean((p.baseUrl || p.proxyUrl) && p.selectedModel);
}

function buildGenPrompt(path: GamePath): string {
  const { attrs, traits, reps, crises } = lists(path);
  const pathName = path === 'creator' ? 'SÁNG THẾ THẦN (đấng sáng tạo vũ trụ)'
    : path === 'god' ? 'THẦN (vị thần có tín đồ)'
    : 'PHÀM NHÂN (người thường có tiềm năng phong thần)';

  const attrList = attrs.map(a => `"${a.key}" (${a.name}, ${a.min}..${a.max})`).join(', ');
  const traitList = traits.map(t => `"${t.id}" (${t.name})`).join(', ');
  const repList = reps.map(r => `"${r.id}" (${r.name})`).join(', ');
  const crisisList = crises.filter(c => c.id !== 'custom').map(c => `"${c.id}" (${c.name})`).join(', ');

  const pathFields = path === 'creator'
    ? `"cosmicDomain","cosmicRules","pantheonName"`
    : path === 'god'
    ? `"divineRealm","faction","pantheonName","era","region"`
    : `"mortalClass","mortalOrigin","faction","era","region"`;

  return `Bạn là trợ lý tạo nhân vật cho game nhập vai GOD SIMULATOR. Người chơi đi con đường ${pathName}.
Dựa trên MÔ TẢ của người chơi, hãy tạo một hồ sơ nhân vật hợp lý, giàu chất riêng, bằng TIẾNG VIỆT.

CHỈ trả về MỘT khối JSON hợp lệ (không kèm giải thích, không markdown), theo schema:
{
  "name": string,               // tên/danh xưng
  "title": string,              // danh hiệu (có thể rỗng)
  "age": number | null,
  "appearance": string,         // ngoại hình ngắn gọn
  "backstory": string,          // bối cảnh 2-4 câu
  ${pathFields.split(',').map(f => `${f}: string`).join(',\n  ')},
  "eraDescription": string,
  "attributes": { ${attrs.map(a => `"${a.key}": number`).join(', ')} },
  "traits": string[],           // 1-3 id trong danh sách bẩm phú
  "customTraits": string,       // bẩm phú riêng (có thể rỗng)
  "reputation": string,         // 1 id danh tiếng
  "crisis": string              // 1 id khủng hoảng, HOẶC câu mô tả khủng hoảng riêng
}

Giá trị hợp lệ:
- attributes keys: ${attrList}. Cân đối theo mô tả, tổng thể không quá mạnh.
- traits (chọn id): ${traitList}
- reputation (1 id): ${repList}
- crisis (1 id hoặc mô tả riêng): ${crisisList}

Nếu mô tả không nhắc tới trường nào, tự suy luận hợp lý. KHÔNG bịa key ngoài schema.`;
}

interface GenJson {
  [k: string]: unknown;
}

function extractJson(text: string): GenJson | null {
  let s = text.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/i.exec(s);
  if (fence) s = fence[1].trim();
  // fallback: first {...last}
  if (!s.startsWith('{')) {
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) s = s.slice(a, b + 1);
  }
  try { return JSON.parse(s) as GenJson; } catch { return null; }
}

const asString = (v: unknown, max = 500): string => (typeof v === 'string' ? v.slice(0, max) : '');

/** Chuyển JSON của AI → Partial<CharacterData> đã kiểm định & giới hạn */
export function parseCharacter(path: GamePath, raw: string): Partial<CharacterData> {
  const j = extractJson(raw);
  if (!j) throw new Error('AI không trả về JSON hợp lệ.');
  const { attrs, traits, reps, crises } = lists(path);

  const out: Partial<CharacterData> = {};
  out.name = asString(j.name, 200);
  out.title = asString(j.title, 200);
  if (typeof j.age === 'number') out.age = Math.max(0, Math.round(j.age));
  out.appearance = asString(j.appearance, 300);
  out.backstory = asString(j.backstory, 800);
  out.eraDescription = asString(j.eraDescription, 500);
  for (const key of ['cosmicDomain', 'cosmicRules', 'pantheonName', 'divineRealm', 'faction', 'era', 'region', 'mortalClass', 'mortalOrigin', 'customTraits'] as const) {
    const v = asString(j[key], 500);
    if (v) (out as Record<string, unknown>)[key] = v;
  }

  // Attributes — clamp về min..max, chỉ nhận key hợp lệ
  if (j.attributes && typeof j.attributes === 'object') {
    const src = j.attributes as Record<string, unknown>;
    const clamped: Record<string, number> = {};
    for (const a of attrs) {
      const raw = src[a.key];
      if (typeof raw === 'number') clamped[a.key] = Math.max(a.min, Math.min(a.max, Math.round(raw)));
    }
    if (Object.keys(clamped).length) out.attributes = clamped;
  }

  // Traits — chỉ nhận id tồn tại
  if (Array.isArray(j.traits)) {
    const ids = j.traits.filter((t): t is string => typeof t === 'string' && traits.some(td => td.id === t));
    if (ids.length) out.traits = ids.slice(0, 4);
  }

  // Reputation — id hợp lệ
  if (typeof j.reputation === 'string' && reps.some(r => r.id === j.reputation)) {
    out.reputation = j.reputation;
  }

  // Crisis — id hợp lệ, hoặc câu mô tả riêng
  if (typeof j.crisis === 'string' && j.crisis.trim()) {
    out.crisis = crises.some(c => c.id === j.crisis) ? j.crisis : j.crisis.slice(0, 300);
  }

  return out;
}

/** Gọi AI tạo nhân vật từ mô tả tự do */
export async function generateCharacter(path: GamePath, description: string): Promise<Partial<CharacterData>> {
  if (!hasConnection()) {
    throw new Error('Chưa cấu hình kết nối AI (Base URL + Model). Hãy vào Cài Đặt trước.');
  }
  const sys = buildGenPrompt(path);
  const user = `MÔ TẢ CỦA NGƯỜI CHƠI:\n${description.trim()}\n\nHãy tạo hồ sơ và trả về DUY NHẤT khối JSON.`;

  let full = '';
  await sendChat({
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: user },
    ],
    onChunk: (c) => { full += c; },
    onDone: (t) => { if (t) full = t; },
  });

  return parseCharacter(path, full);
}
