/* ═══════════════════════════════════════════════════════
   LOREBOOK ENGINE — kích hoạt World Info + bảo trì bằng AI
   - Kích hoạt: key (primary/secondary + logic), constant (đèn
     xanh), đệ quy (recursion), order, budget, probability,
     case/whole-word, sticky/cooldown/delay.
   - Bảo trì: gọi AI cuối lượt để tạo/bổ sung/xóa entries.
   ═══════════════════════════════════════════════════════ */

import {
  useLorebookStore, LOGIC,
  type LoreEntry,
} from '@/stores/lorebookStore';
import { useConnectionStore } from '@/stores/connectionStore';
import { useChatStore } from '@/stores/chatStore';
import { renderStateForAI } from '@/engine/mvu/stateRenderer';
import type { MvuPatchOp } from '@/engine/mvu/patchEngine';

export interface LoreInjection {
  before: string;   // position 0 — trước "char defs" (đầu system)
  after: string;    // position 1 — sau "char defs"
  anTop: string;    // position 2 — đầu Author's Note
  anBottom: string; // position 3 — cuối Author's Note
  depthBlocks: { content: string; depth: number; role: number }[]; // position 4 (@depth)
}

export interface ActivationResult {
  injection: LoreInjection;
  activeUids: number[];
  matchedDelayedUids: number[];
  debug: { uid: number; title: string; reason: string }[];
}

const EMPTY: LoreInjection = { before: '', after: '', anTop: '', anBottom: '', depthBlocks: [] };

/* ── So khớp từ khóa ── */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keyInText(key: string, text: string, caseSensitive: boolean, wholeWords: boolean): boolean {
  const k = key.trim();
  if (!k) return false;
  if (wholeWords && /^[\p{L}\p{N}_ ]+$/u.test(k)) {
    // ranh giới từ (hỗ trợ Unicode); chỉ dùng khi key là chữ/số thường
    const flags = caseSensitive ? 'u' : 'iu';
    try {
      const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escapeRegExp(k)}(?![\\p{L}\\p{N}_])`, flags);
      return re.test(text);
    } catch {
      /* fallthrough */
    }
  }
  return caseSensitive ? text.includes(k) : text.toLowerCase().includes(k.toLowerCase());
}

/** Entry có khớp text không (primary ANY + secondary theo logic) */
function entryMatches(e: LoreEntry, text: string, cs: boolean, ww: boolean): boolean {
  const primaryHit = e.key.some(k => keyInText(k, text, cs, ww));
  if (!primaryHit) return false;
  if (!e.selective || e.keysecondary.length === 0) return true;

  const secHits = e.keysecondary.map(k => keyInText(k, text, cs, ww));
  const anyHit = secHits.some(Boolean);
  const allHit = secHits.every(Boolean);
  switch (e.selectiveLogic) {
    case LOGIC.AND_ANY: return anyHit;
    case LOGIC.AND_ALL: return allHit;
    case LOGIC.NOT_ANY: return !anyHit;
    case LOGIC.NOT_ALL: return !allHit;
    default: return anyHit;
  }
}

/* ═══════════════════════════════════════════════════════
   KÍCH HOẠT (thuần — không ghi runtime)
   ═══════════════════════════════════════════════════════ */
export function activateLorebook(
  messages: { role: string; content: string }[],
  currentTurn: number,
): ActivationResult {
  const st = useLorebookStore.getState();
  const S = st.settings;
  if (!S.enabled) return { injection: EMPTY, activeUids: [], matchedDelayedUids: [], debug: [] };

  const pool = st.entries.filter(e => !e.disable);
  const scanText = messages.slice(-Math.max(1, S.scanDepth)).map(m => m.content).join('\n');

  const csOf = (e: LoreEntry) => e.caseSensitive ?? S.caseSensitive;
  const wwOf = (e: LoreEntry) => e.matchWholeWords ?? S.matchWholeWords;
  const rtOf = (uid: number) => st.runtime[uid] || {};

  const active = new Map<number, LoreEntry>();
  const delayed = new Set<number>();
  const debug: ActivationResult['debug'] = [];

  const inCooldown = (e: LoreEntry) => {
    const rt = rtOf(e.uid);
    return rt.cooldownUntil != null && currentTurn < rt.cooldownUntil;
  };
  const passProbability = (e: LoreEntry) => {
    if (!e.useProbability || e.probability >= 100) return true;
    return Math.random() * 100 < e.probability;
  };
  const passDelay = (e: LoreEntry) => {
    if (!e.delay || e.delay <= 0) return true;
    const rt = rtOf(e.uid);
    if (rt.delaySeenTurn == null) { delayed.add(e.uid); return false; }
    return currentTurn - rt.delaySeenTurn >= e.delay;
  };

  const tryAdd = (e: LoreEntry, reason: string, viaRecursion: boolean): boolean => {
    if (active.has(e.uid)) return false;
    if (viaRecursion && e.excludeRecursion) return false;
    if (!e.constant && inCooldown(e)) { debug.push({ uid: e.uid, title: e.comment, reason: 'cooldown' }); return false; }
    if (!e.constant && !passDelay(e)) { debug.push({ uid: e.uid, title: e.comment, reason: 'delay' }); return false; }
    if (!e.constant && !passProbability(e)) { debug.push({ uid: e.uid, title: e.comment, reason: 'probability-miss' }); return false; }
    active.set(e.uid, e);
    debug.push({ uid: e.uid, title: e.comment, reason });
    return true;
  };

  // 1) Sticky còn hiệu lực → giữ active
  for (const e of pool) {
    const rt = rtOf(e.uid);
    if (rt.stickyUntil != null && currentTurn < rt.stickyUntil) tryAdd(e, 'sticky', false);
  }
  // 2) Constant (đèn xanh) → luôn active
  for (const e of pool) {
    if (e.constant) tryAdd(e, 'constant', false);
  }
  // 3) Khớp key trong chat
  for (const e of pool) {
    if (e.constant || e.delayUntilRecursion) continue;
    if (entryMatches(e, scanText, csOf(e), wwOf(e))) tryAdd(e, 'key', false);
  }

  // 4) Đệ quy: quét nội dung entry đã bật để tìm thêm
  if (S.recursion) {
    for (let pass = 0; pass < Math.max(0, S.maxRecursion); pass++) {
      const recText = [...active.values()]
        .filter(e => !e.preventRecursion)
        .map(e => e.content)
        .join('\n');
      if (!recText.trim()) break;
      let added = 0;
      for (const e of pool) {
        if (e.constant || active.has(e.uid) || e.excludeRecursion) continue;
        if (entryMatches(e, recText, csOf(e), wwOf(e))) {
          if (tryAdd(e, `recursion-${pass + 1}`, true)) added++;
        }
      }
      if (added === 0) break;
    }
  }

  // 5) Sắp xếp theo order (cao = ưu tiên, chèn sau) + budget
  const chosen = [...active.values()].sort((a, b) => a.order - b.order);
  const injection: LoreInjection = { before: '', after: '', anTop: '', anBottom: '', depthBlocks: [] };
  let used = 0;
  const parts: Record<0 | 1 | 2 | 3, string[]> = { 0: [], 1: [], 2: [], 3: [] };

  for (const e of chosen) {
    const text = e.content.trim();
    if (!text) continue;
    if (!e.ignoreBudget) {
      if (used + text.length > S.budgetChars) continue;
      used += text.length;
    }
    if (e.position === 4) {
      injection.depthBlocks.push({ content: text, depth: Math.max(0, e.depth), role: e.role ?? 0 });
    } else {
      const p = (e.position >= 0 && e.position <= 3 ? e.position : 1) as 0 | 1 | 2 | 3;
      parts[p].push(text);
    }
  }
  injection.before = parts[0].join('\n\n');
  injection.after = parts[1].join('\n\n');
  injection.anTop = parts[2].join('\n\n');
  injection.anBottom = parts[3].join('\n\n');

  return {
    injection,
    activeUids: chosen.map(e => e.uid),
    matchedDelayedUids: [...delayed],
    debug,
  };
}

/** Ghi runtime (sticky/cooldown/delay) — gọi 1 lần sau khi lượt hoàn tất */
export function commitLorebook(activeUids: number[], delayedUids: number[], currentTurn: number): void {
  const st = useLorebookStore.getState();
  const byUid = new Map(st.entries.map(e => [e.uid, e]));

  for (const uid of activeUids) {
    const e = byUid.get(uid);
    if (!e) continue;
    const rt = { ...(st.runtime[uid] || {}) };
    if (e.sticky > 0) {
      rt.stickyUntil = currentTurn + e.sticky;
      if (e.cooldown > 0) rt.cooldownUntil = rt.stickyUntil + e.cooldown;
    } else if (e.cooldown > 0) {
      rt.cooldownUntil = currentTurn + e.cooldown + 1;
    }
    st.setRuntime(uid, rt);
  }
  for (const uid of delayedUids) {
    const rt = { ...(st.runtime[uid] || {}) };
    if (rt.delaySeenTurn == null) rt.delaySeenTurn = currentTurn;
    st.setRuntime(uid, rt);
  }
}

/* ═══════════════════════════════════════════════════════
   BẢO TRÌ BẰNG AI (cuối lượt): tạo / bổ sung / xóa entries
   ═══════════════════════════════════════════════════════ */

function getMaintConn(): { url: string; headers: Record<string, string>; model: string; provider: string } | null {
  const p = useConnectionStore.getState().getActiveProfile();
  if (!(p.baseUrl || p.proxyUrl) || !p.selectedModel) return null;
  const base = p.baseUrl ? p.baseUrl.replace(/\/+$/, '') : '';
  const key = p.apiKeys[p.currentKeyIndex] || '';
  const effectiveKey = key || p.proxyPassword || '';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  switch (p.provider) {
    case 'anthropic':
      headers['x-api-key'] = effectiveKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
      break;
    case 'google':
      headers['x-goog-api-key'] = effectiveKey;
      break;
    default: // openai, custom
      if (effectiveKey) headers['Authorization'] = `Bearer ${effectiveKey}`;
      break;
  }

  if (p.proxyPassword) headers['X-Proxy-Password'] = p.proxyPassword;

  let url = `${base}/chat/completions`;
  if (p.proxyUrl) {
    const proxy = p.proxyUrl.replace(/\/+$/, '');
    url = base ? `${proxy}?target=${encodeURIComponent(url)}` : `${proxy}/chat/completions`;
  }
  return { url, headers, model: p.selectedModel, provider: p.provider };
}

function buildMaintenancePrompt(
  recentText: string,
  entries: LoreEntry[],
  stateBlock: string,
  livingWorld: boolean,
): string {
  const lines: string[] = [];
  lines.push('Bạn là "Người Giữ Chính Sử" cho một game nhập vai AI. Cuối lượt này, làm 2 việc trong MỘT phản hồi JSON:');
  lines.push('A) LORE — bảo trì Sổ Tri Thức: tạo entry MỚI cho nhân vật/địa điểm/thế lực/khái niệm/vật phẩm quan trọng vừa xuất hiện, BỔ SUNG entry đã có, hoặc XÓA entry lỗi thời.');
  lines.push('B) WORLD — phát patch trạng thái để:');
  lines.push('   · SỬA mâu thuẫn rõ ràng với CHÍNH SỬ (người đã chết bị coi còn sống, id/tên sai, số liệu lệch lời kể...).');
  if (livingWorld) {
    lines.push('   · ĐẨY 1–2 diễn biến OFF-SCREEN (chế độ THẾ GIỚI SỐNG đang bật): để NPC/thế lực theo đuổi "mưu cầu" riêng, sự kiện nền xảy ra song song dù người chơi vắng mặt. Cập nhật npcs.<id>.agenda/affinity, thêm mốc timeline, v.v.');
  } else {
    lines.push('   · (Chế độ trọng tâm người chơi: KHÔNG tự bịa diễn biến lớn — chỉ sửa mâu thuẫn.)');
  }
  lines.push('');
  lines.push('=== CHÍNH SỬ HIỆN TẠI (nguồn sự thật — dùng đúng [id]) ===');
  lines.push(stateBlock.slice(0, 3500));
  lines.push('');
  lines.push('=== ENTRY LORE HIỆN CÓ ===');
  if (entries.length === 0) lines.push('(chưa có)');
  for (const e of entries.slice(0, 60)) {
    lines.push(`[uid ${e.uid}] "${e.comment || '(không tên)'}" · key: ${e.key.join(', ') || '—'}`);
  }
  lines.push('');
  lines.push('=== DIỄN BIẾN GẦN NHẤT ===');
  lines.push(recentText.slice(0, 3500));
  lines.push('');
  lines.push('CHỈ trả về MỘT object JSON (không markdown, không giải thích):');
  lines.push('{');
  lines.push('  "lore": [');
  lines.push('    {"op":"create","comment":"Tên entry","key":["từ khóa 1","từ khóa 2"],"content":"Nội dung súc tích, **in đậm** danh từ riêng","constant":false,"position":1,"order":100},');
  lines.push('    {"op":"update","uid":3,"appendContent":"Thông tin mới","addKeys":["từ khóa mới"]},');
  lines.push('    {"op":"delete","uid":5}');
  lines.push('  ],');
  lines.push('  "world": [');
  lines.push('    {"op":"delta","path":"npcs.<id>.affinity","value":-5},');
  lines.push('    {"op":"replace","path":"npcs.<id>.agenda","value":"mưu cầu mới"},');
  lines.push('    {"op":"insert","path":"timeline","value":{"turn":0,"event":"Diễn biến nền...","category":"world","visibility":"public","witnesses":[]}}');
  lines.push('  ]');
  lines.push('}');
  lines.push('Quy tắc WORLD: CHỈ dùng [id] đã có trong CHÍNH SỬ; KHÔNG tạo id/thực thể mới không có thật; KHÔNG cho world.time chạy lùi; đổi ÍT mà ĐÚNG. Không cần đổi gì thì để "world":[]. Không cần sửa lore thì để "lore":[].');
  return lines.join('\n');
}

interface LoreOp {
  op: 'create' | 'update' | 'delete';
  uid?: number;
  comment?: string;
  key?: string[];
  addKeys?: string[];
  content?: string;
  appendContent?: string;
  constant?: boolean;
  position?: number;
  order?: number;
}

const WORLD_OPS = new Set(['replace', 'delta', 'insert', 'remove', 'move']);

function toWorldOps(arr: unknown): MvuPatchOp[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((o: any) =>
    o && typeof o.op === 'string' && WORLD_OPS.has(o.op) &&
    (typeof o.path === 'string' || (o.op === 'move' && typeof o.from === 'string' && typeof o.to === 'string'))
  ) as MvuPatchOp[];
}

/** Parse phản hồi gộp: object {lore, world} — hoặc mảng thuần (tương thích cũ = chỉ lore). */
function parseMaintenance(raw: string): { lore: LoreOp[]; world: MvuPatchOp[] } {
  let s = raw.trim();
  const fence = /```(?:json)?\s*([\s\S]*?)```/.exec(s);
  if (fence) s = fence[1].trim();

  let parsed: any = null;
  try {
    parsed = JSON.parse(s);
  } catch {
    const a = s.indexOf('{'), b = s.lastIndexOf('}');
    if (a >= 0 && b > a) { try { parsed = JSON.parse(s.slice(a, b + 1)); } catch { /* noop */ } }
  }

  if (Array.isArray(parsed)) {
    return { lore: parsed.filter((o: any) => o && typeof o.op === 'string'), world: [] };
  }
  if (parsed && typeof parsed === 'object') {
    const lore = Array.isArray(parsed.lore) ? parsed.lore.filter((o: any) => o && typeof o.op === 'string') : [];
    return { lore, world: toWorldOps(parsed.world) };
  }
  return { lore: [], world: [] };
}

function applyLoreOps(ops: LoreOp[]): { created: number; updated: number; deleted: number } {
  const st = useLorebookStore.getState();
  let created = 0, updated = 0, deleted = 0;
  const strArr = (v: any): string[] => Array.isArray(v) ? v.filter((x: any) => typeof x === 'string' && x.trim()) : [];

  for (const op of ops) {
    if (op.op === 'delete' && typeof op.uid === 'number') {
      if (st.entries.some(e => e.uid === op.uid)) { st.removeEntry(op.uid); deleted++; }
    } else if (op.op === 'update' && typeof op.uid === 'number') {
      const e = useLorebookStore.getState().entries.find(x => x.uid === op.uid);
      if (!e) continue;
      const patch: Partial<LoreEntry> = {};
      if (typeof op.content === 'string') patch.content = op.content.slice(0, 20000);
      if (typeof op.appendContent === 'string' && op.appendContent.trim()) {
        patch.content = `${e.content}\n${op.appendContent}`.slice(0, 20000);
      }
      const addk = strArr(op.addKeys).concat(strArr(op.key));
      if (addk.length) patch.key = Array.from(new Set([...e.key, ...addk]));
      if (typeof op.comment === 'string' && op.comment.trim()) patch.comment = op.comment.slice(0, 300);
      if (Object.keys(patch).length) { st.updateEntry(op.uid, patch); updated++; }
    } else if (op.op === 'create') {
      const uid = st.addEntry();
      st.updateEntry(uid, {
        comment: (op.comment || 'Entry mới').slice(0, 300),
        key: strArr(op.key),
        content: (op.content || '').slice(0, 20000),
        constant: !!op.constant,
        position: typeof op.position === 'number' ? op.position : 1,
        order: typeof op.order === 'number' ? op.order : 100,
        selective: true,
      });
      created++;
    }
  }
  return { created, updated, deleted };
}

/** Gọi AI cuối lượt để bảo trì Sổ Tri Thức. */
export async function runLorebookMaintenance(recentText: string): Promise<{ created: number; updated: number; deleted: number } | null> {
  const st = useLorebookStore.getState();
  if (!st.settings.autoUpdate) return null;
  const conn = getMaintConn();
  if (!conn) { st.setStatus('error', 'Chưa cấu hình kết nối AI'); return null; }
  if (!recentText.trim()) return null;

  st.setStatus('running', 'Đang cập nhật Chính Sử...');
  try {
    const gameState = useChatStore.getState().statData;
    const stateBlock = renderStateForAI(gameState);
    const livingWorld = gameState.settings.playerCentric === false;
    const prompt = buildMaintenancePrompt(recentText, st.entries, stateBlock, livingWorld);
    const systemContent = 'Bạn là Người Giữ Chính Sử của game. Chỉ trả về MỘT object JSON thuần {lore, world}.';

    // Build body matching provider format (same as apiClient.ts)
    let body: Record<string, unknown>;
    switch (conn.provider) {
      case 'anthropic':
        body = {
          model: conn.model,
          system: systemContent,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 1500,
          temperature: 0.4,
          stream: false,
        };
        break;
      case 'google':
        body = {
          contents: [
            { role: 'user', parts: [{ text: systemContent + '\n\n' + prompt }] },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1500,
          },
        };
        break;
      default: // openai, custom
        body = {
          model: conn.model,
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: prompt },
          ],
          max_tokens: 1500,
          temperature: 0.4,
          stream: false,
        };
        break;
    }

    const response = await fetch(conn.url, {
      method: 'POST',
      headers: conn.headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(45000),
    });
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();

    // Extract text from provider-specific response format
    let text = '';
    switch (conn.provider) {
      case 'anthropic':
        text = data.content?.[0]?.text ?? '';
        break;
      case 'google':
        text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
        break;
      default:
        text = data.choices?.[0]?.message?.content ?? '';
        break;
    }

    const { lore, world } = parseMaintenance(text);
    const res = applyLoreOps(lore);

    // Áp patch WORLD (world-sim + canon-fix) qua pipeline an toàn của chatStore.
    let worldApplied = 0;
    if (world.length > 0) {
      try { worldApplied = useChatStore.getState().applyBackgroundPatches(world).applied; }
      catch (e) { console.warn('[Chính Sử] world patch error:', e); }
    }

    const worldMsg = worldApplied > 0 ? ` · ${worldApplied} diễn biến` : '';
    st.setStatus('done', `Chính Sử: +${res.created} lore · ~${res.updated} · -${res.deleted}${worldMsg}`);
    setTimeout(() => { if (useLorebookStore.getState().status === 'done') useLorebookStore.getState().setStatus('idle'); }, 4000);
    return res;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    st.setStatus('error', msg);
    console.warn('[Lorebook] maintenance error:', msg);
    return null;
  }
}
