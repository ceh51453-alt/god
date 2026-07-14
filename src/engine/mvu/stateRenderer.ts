/* ═══════════════════════════════════════════════════════
   MVU STATE RENDERER — Format state for AI consumption
   Renders stat_data into human-readable Vietnamese text
   so AI can "see" the current game state naturally.
   ═══════════════════════════════════════════════════════ */

import type { StatData, NpcData, EntityData } from './schema';
import { deriveAffinityStage } from './schema';
import { deriveTier, deriveMeters, progressionLabel } from '../mechanics/pathMechanics';
import type { LadderOverride } from '../canon/progression';
import { formatWorldTime } from './timeEngine';

/**
 * Render the full state into a text block for injection into AI prompt.
 * Uses Vietnamese labels and natural language, not raw JSON.
 */
export function renderStateForAI(state: StatData, ladder?: LadderOverride | null): string {
  const sections: string[] = [];

  // ── Identity ──
  const pathLabel = state.path === 'creator' ? 'Đấng Sáng Tạo' :
                    state.path === 'god' ? 'Thần' : 'Phàm Nhân';
  sections.push(`=== TRẠNG THÁI HIỆN TẠI ===`);
  sections.push(`Danh xưng: ${state.name || 'Chưa đặt tên'} — ${pathLabel}`);
  if (state.title) sections.push(`Biểu tự: ${state.title}`);
  if (state.age != null) sections.push(`Tuổi: ${state.age}`);

  // ── Attributes ──
  if (Object.keys(state.attributes).length > 0) {
    const attrLines = Object.entries(state.attributes)
      .map(([key, val]) => `  ${key}: ${val}`)
      .join('\n');
    sections.push(`\nChỉ số:\n${attrLines}`);
  }

  // ── Resources ──
  const res = state.resources;
  const resLines: string[] = [];
  if (res.power > 0) resLines.push(`Quyền năng: ${res.power}`);
  if (res.followers > 0) resLines.push(`Tín đồ: ${res.followers.toLocaleString()}`);
  if (res.wealth > 0) resLines.push(`Tài sản: ${res.wealth.toLocaleString()}`);
  if (res.faith > 0) resLines.push(`Tín ngưỡng: ${res.faith}/100`);
  if (res.karma !== 0) resLines.push(`Nghiệp: ${res.karma > 0 ? '+' : ''}${res.karma}`);
  if (resLines.length > 0) {
    sections.push(`\nTài nguyên:\n  ${resLines.join('\n  ')}`);
  }

  // ── Mechanics & Tier (LIVE) ──
  const tier = deriveTier(state.path, res.progress, ladder?.tiers);
  const mechLines: string[] = [];
  mechLines.push(
    `${progressionLabel(state.path, ladder?.label)}: ${tier.name} — ${tier.desc}`,
    tier.next != null
      ? `Tiến Trình: ${res.progress}/${tier.next} (${tier.pct}% tới "${tier.nextName}")`
      : `Tiến Trình: ${res.progress} (đã đạt đỉnh cao nhất)`,
  );
  for (const m of deriveMeters(state)) {
    mechLines.push(`${m.label}: ${m.value}${m.hint ? ` (${m.hint})` : ''}`);
  }
  sections.push(`\nCơ chế & Cấp bậc:\n  ${mechLines.join('\n  ')}`);

  // ── Thời gian in-world (LIVE) ──
  const timeStr = formatWorldTime(state.world.time);
  if (timeStr) {
    const tLines = [timeStr];
    if (state.world.time.cycleRule) tLines.push(`Chu kỳ: ${state.world.time.cycleRule}`);
    sections.push(`\nThời gian:\n  ${tLines.join('\n  ')}`);
  }

  // ── World ──
  const w = state.world;
  const worldLines: string[] = [];
  if (w.era) worldLines.push(`Kỷ nguyên: ${w.era}`);
  if (w.region) worldLines.push(`Khu vực: ${w.region}`);
  if (w.faction) worldLines.push(`Phe phái: ${w.faction}`);
  if (w.cosmicDomain) worldLines.push(`Miền sáng tạo: ${w.cosmicDomain}`);
  if (w.divineRealm) worldLines.push(`Miền quyền năng: ${w.divineRealm}`);
  if (w.reputation) worldLines.push(`Danh tiếng: ${w.reputation}`);
  if (w.crisis) worldLines.push(`Khủng hoảng: ${w.crisis}`);
  if (w.pantheonName) worldLines.push(`Thần hệ: ${w.pantheonName}`);
  if (worldLines.length > 0) {
    sections.push(`\nThế giới:\n  ${worldLines.join('\n  ')}`);
  }

  // ── Traits ──
  if (state.traits.length > 0) {
    sections.push(`\nBẩm phú: ${state.traits.join(', ')}`);
  }

  // ── Abilities ──
  if (Object.keys(state.abilities).length > 0) {
    const abilLines = Object.entries(state.abilities)
      .map(([name, data]) => `  ${name} (Cấp ${data.level})`)
      .join('\n');
    sections.push(`\nKỹ năng:\n${abilLines}`);
  }

  // ── NPCs (compact for context) ──
  const npcEntries = Object.entries(state.npcs);
  if (npcEntries.length > 0) {
    const npcLines = npcEntries.map(([id, npc]) => renderNpcCompact(id, npc)).join('\n');
    sections.push(`\nMối quan hệ (dùng đúng [id] khi cập nhật):\n${npcLines}`);
  }

  // ── Entities ──
  const entityEntries = Object.entries(state.entities);
  if (entityEntries.length > 0) {
    const entLines = entityEntries
      .slice(0, 12)
      .map(([id, ent]) => renderEntityCompact(id, ent))
      .join('\n');
    sections.push(`\nThực thể (dùng đúng [id] khi cập nhật):\n${entLines}`);
    if (entityEntries.length > 12) {
      sections.push(`  ... và ${entityEntries.length - 12} thực thể khác`);
    }
  }

  // ── Active Quests ──
  const activeQuests = Object.entries(state.quests)
    .filter(([, q]) => q.status === 'active');
  if (activeQuests.length > 0) {
    const qLines = activeQuests.map(([id, q]) => {
      const done = q.objectives.filter(o => o.done).length;
      const total = q.objectives.length;
      return `  ${q.title} [${done}/${total}] (${q.type})`;
    }).join('\n');
    sections.push(`\nNhiệm vụ đang làm:\n${qLines}`);
  }

  // ── Companion ──
  if (state.companion.name) {
    sections.push(`\nĐồng hành: ${state.companion.name}`);
    if (state.companion.description) {
      sections.push(`  ${state.companion.description}`);
    }
  }

  // ── Turn ──
  sections.push(`\nLượt: ${state._turnCount} | Seed: ${state._seed}`);

  return sections.join('\n');
}

function renderNpcCompact(id: string, npc: NpcData): string {
  const stage = deriveAffinityStage(npc.affinity);
  const status = npc.alive ? '' : ' [Đã Chết]';
  const role = npc.role ? ` — ${npc.role}` : '';
  const aka = npc.aliases && npc.aliases.length ? ` (aka: ${npc.aliases.join(', ')})` : '';
  const lines = [`  [${id}] ${npc.name}${role}: ${stage} (${npc.affinity})${status}${aka}`];
  if (npc.agenda) lines.push(`      mưu cầu: ${npc.agenda}`);
  // Ranh giới tri thức: NPC chỉ được hành xử theo những gì liệt kê ở đây.
  if (npc.knows && npc.knows.length) lines.push(`      biết: ${npc.knows.slice(0, 4).join('; ')}`);
  if (npc.memories && npc.memories.length) lines.push(`      nhớ: ${npc.memories.slice(0, 3).join('; ')}`);
  if (npc.promises && npc.promises.length) lines.push(`      hứa: ${npc.promises.slice(0, 3).join('; ')}`);
  return lines.join('\n');
}

function renderEntityCompact(id: string, ent: EntityData): string {
  const status = ent.status !== 'active' ? ` [${ent.status}]` : '';
  const aka = ent.aliases && ent.aliases.length ? ` (aka: ${ent.aliases.join(', ')})` : '';
  return `  [${id}] ${ent.name} (${ent.type}, Sức mạnh: ${ent.power})${status}${aka}`;
}

/**
 * Build the MVU update instruction prompt.
 * This tells AI HOW to format state changes in its response.
 */
export function buildMvuInstructionPrompt(): string {
  return `
=== HƯỚNG DẪN CẬP NHẬT TRẠNG THÁI ===

Sau mỗi lượt, nếu có thay đổi trạng thái (tài nguyên, quan hệ, thế giới...), hãy THÊM một khối <UpdateVariable> ở CUỐI phản hồi.
Khối này sẽ BỊ ẨN khỏi người chơi, chỉ engine đọc.

Định dạng:
<UpdateVariable>
[
  {"op": "delta", "path": "resources.power", "value": -10},
  {"op": "replace", "path": "world.reputation", "value": "Lừng Danh"},
  {"op": "insert", "path": "npcs", "key": "thor", "value": {"name": "Thor", "title": "Thần Sấm", "affinity": 20, "role": "Đồng minh"}},
  {"op": "delta", "path": "resources.followers", "value": 500},
  {"op": "insert", "path": "timeline", "value": {"turn": 5, "event": "Tạo ra sấm sét đầu tiên", "category": "creation"}}
]
</UpdateVariable>

Các phép toán:
- "replace": Thay thế giá trị. Dùng cho text, enum, boolean.
- "delta": Cộng/trừ số. Dùng cho tài nguyên, chỉ số. Giá trị âm = trừ.
- "insert": Thêm vào record (cần key) hoặc mảng.
- "remove": Xóa khỏi record (cần key) hoặc mảng (cần index).
- "move": Di chuyển từ path này sang path khác.

QUY TẮC BẮT BUỘC:
1. KHÔNG ghi vào các field bắt đầu bằng "_" (readonly, engine quản lý).
2. Số liệu trong <UpdateVariable> PHẢI khớp với lời kể (kể nhận 500 tín đồ → delta +500).
3. Nếu KHÔNG có thay đổi trạng thái → KHÔNG thêm khối <UpdateVariable>.
4. Lời kể ĐẶT TRƯỚC khối, khối đặt cuối cùng.
5. TRẠNG THÁI HIỆN TẠI (ở trên) là SỰ THẬT. Nếu mâu thuẫn với trí nhớ, LẤY TRẠNG THÁI LÀM CHUẨN.
6. DÙNG LẠI ID CÓ SẴN: Khi cập nhật một nhân vật/thực thể ĐÃ xuất hiện, dùng ĐÚNG [id] ghi trong phần "Mối quan hệ"/"Thực thể" (vd {"op":"replace","path":"npcs.<id>.role","value":"..."} hoặc {"op":"delta","path":"npcs.<id>.affinity","value":+5}). TUYỆT ĐỐI KHÔNG tạo id/key mới cho ai đã tồn tại — dù ngươi gọi họ bằng tên khác. Chỉ "insert" khi thực thể LẦN ĐẦU xuất hiện.
7. THỜI GIAN TRÔI: Mỗi lượt có thời gian trôi trong truyện, đẩy đồng hồ bằng {"op":"delta","path":"world.time.day","value":+N} (dùng .season/.year cho bước nhảy lớn). Engine tự dồn tràn Ngày→Mùa→Năm theo "Chu kỳ" đã định; KHÔNG cho thời gian chạy lùi. Nhân vật, sự kiện, mùa màng phải tôn trọng lịch này thay vì bịa mốc thời gian.
   · Nếu truyện định ra một lịch/chu kỳ mới (vd "1 năm có 4 mùa, mỗi mùa 90 ngày, tên mùa Xuân-Hạ-Thu-Đông"), ghi MỘT LẦN bằng replace: world.time.calendarName / world.time.cycleRule / world.time.daysPerSeason / world.time.seasonsPerYear / world.time.seasonNames.
8. NPC KHÔNG TOÀN TRI: Mỗi NPC chỉ được biết & hành xử dựa trên (a) việc CÔNG KHAI, (b) việc họ trực tiếp CHỨNG KIẾN hoặc được kể lại, (c) danh sách "biết/nhớ/hứa" của CHÍNH họ ở phần Mối quan hệ. TUYỆT ĐỐI không để một NPC nhắc tới bí mật, hành động lén lút, hay việc xảy ra lúc họ vắng mặt như thể đương nhiên biết. Khi một NPC vừa HỌC được điều gì (được thấy/nghe kể), ghi lại: {"op":"insert","path":"npcs.<id>.knows","value":"điều vừa biết"}.
9. BÍ MẬT & NHÂN CHỨNG: Ghi sự kiện đáng nhớ vào timeline kèm mức lộ & nhân chứng: {"op":"insert","path":"timeline","value":{"turn":N,"event":"...","category":"...","visibility":"public|private|secret","witnesses":["<id nhân chứng>"]}}. Việc người chơi làm kín để visibility "secret", witnesses [] → KHÔNG NPC nào được tự biết cho tới khi thực sự bị phát hiện.
`.trim();
}
