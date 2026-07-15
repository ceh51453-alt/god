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
  const tier = deriveTier(state.path, res.progress, ladder?.tiers, state.world.mortalClass);
  const mechLines: string[] = [];
  mechLines.push(
    `${progressionLabel(state.path, ladder?.label, state.world.mortalClass)}: ${tier.name} — ${tier.desc}`,
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
  const tLines = [];
  if (timeStr) {
    tLines.push(timeStr);
    if (state.world.time.cycleRule) tLines.push(`Chu kỳ: ${state.world.time.cycleRule}`);
  }
  if (state.world.calendar) {
    tLines.push(`Ngày ${state.world.calendar.day} Tháng ${state.world.calendar.month} Năm ${state.world.calendar.year}`);
  }
  if (tLines.length > 0) {
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
  if (w.pantheonName) worldLines.push(`Thần hệ: ${w.pantheonName}`);
  if (w.activeEvents && w.activeEvents.length > 0) {
    const evLines = w.activeEvents.map(ev => 
      `    - [${ev.urgency}%] ${ev.name} (${ev.status})`
    ).join('\n');
    worldLines.push(`Sự kiện thế giới:\n${evLines}`);
  }
  if (worldLines.length > 0) {
    sections.push(`\nThế giới:\n  ${worldLines.join('\n  ')}`);
  }

  // ── Domains & Armies ──
  const domEntries = Object.entries(state.domains || {});
  if (domEntries.length > 0) {
    const dLines = domEntries.map(([id, d]) => {
      let base = `  [${id}] ${d.name} (${d.type} - ${d.size}) | Phồn vinh: ${d.prosperity} | An ninh: ${d.security} | Dân số: ${d.population} | Lòng dân: ${d.loyalty}`;
      base += `\n    Tài nguyên: Vàng ${d.resources.gold}, Lương thực ${d.resources.food}, Gỗ ${d.resources.wood}, Đá ${d.resources.stone}`;
      const bEntries = Object.entries(d.buildings || {});
      if (bEntries.length > 0) {
        const bStrs = bEntries.map(([bId, b]) => `${b.name} (Lv.${b.level}${b.isConstructing ? `, đang xây ${b.turnsLeft} turn` : ''})`);
        base += `\n    Công trình: ${bStrs.join(', ')}`;
      }
      const eEntries = Object.entries(d.edicts || {});
      if (eEntries.length > 0) {
        const eStrs = eEntries.map(([eId, e]) => `${e.title} (${e.status === 'active' ? 'Đang thi hành' : e.status === 'suspended' ? 'Tạm hoãn' : 'Bãi bỏ'})`);
        base += `\n    Pháp lệnh: ${eStrs.join(', ')}`;
      }
      return base;
    }).join('\n');
    sections.push(`\nLãnh địa / Cứ điểm (dùng [id] cập nhật):\n${dLines}`);
  }

  const armEntries = Object.entries(state.armies || {});
  if (armEntries.length > 0) {
    const aLines = armEntries.map(([id, a]) => 
      `  [${id}] ${a.name} (${a.type}) | Quân số: ${a.size} | Sĩ khí: ${a.morale} | Kỷ luật: ${a.discipline || 50} | Trang bị (Lv.${a.equipmentLevel || 1}) | Trạng thái: ${a.status}`
    ).join('\n');
    sections.push(`\nLực lượng quân đội (dùng [id] cập nhật):\n${aLines}`);
  }

  // ── Diplomacy & Council ──
  const dipEntries = Object.entries(state.diplomacy || {});
  if (dipEntries.length > 0) {
    const dipLines = dipEntries.map(([id, d]) => 
      `  [${id}] Trạng thái: ${d.status} | War Score: ${d.warScore}`
    ).join('\n');
    sections.push(`\nNgoại giao (với các thế lực khác):\n${dipLines}`);
  }

  const councilEntries = Object.entries(state.council || {});
  if (councilEntries.length > 0) {
    const councilLines = councilEntries.map(([id, c]) => 
      `  [${id}] ${c.title}: ${c.holderId ? c.holderId : 'Khuyết'} (Năng lực: ${c.competence})`
    ).join('\n');
    sections.push(`\nTiểu Hội Đồng / Bộ máy quản lý:\n${councilLines}`);
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
      const rankStr = q.rank ? ` [Hạng ${q.rank}]` : '';
      return `  ${q.title}${rankStr} [${done}/${total}] (${q.type})`;
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
  const status = npc.alive ? '' : ` [Đã Chết${npc.causeOfDeath ? `: ${npc.causeOfDeath}` : ''}]`;
  const role = npc.role ? ` — ${npc.role}` : '';
  const aka = npc.aliases && npc.aliases.length ? ` (aka: ${npc.aliases.join(', ')})` : '';
  const relTypes = npc.relationshipTypes && npc.relationshipTypes.length ? ` [${npc.relationshipTypes.join(', ')}]` : '';
  
  const lines = [`  [${id}] ${npc.name}${role}${relTypes}: Hảo Cảm ${stage} (${npc.affinity}) | Tin Cậy (${npc.trust || 0})${status}${aka}`];
  
  if (npc.evaluation) lines.push(`      đánh giá: ${npc.evaluation}`);
  if (npc.agenda) lines.push(`      mưu cầu: ${npc.agenda}`);
  
  // Hiển thị tính cách rút gọn (ví dụ: Thiện(+10), Dũng(+20))
  if (npc.personalityAxes) {
    const p = npc.personalityAxes;
    const traits = [];
    if (p.goodEvil !== 0) traits.push(p.goodEvil > 0 ? `Thiện(+${p.goodEvil})` : `Ác(${p.goodEvil})`);
    if (p.braveCoward !== 0) traits.push(p.braveCoward > 0 ? `Dũng(+${p.braveCoward})` : `Hèn(${p.braveCoward})`);
    if (p.loyalTreacherous !== 0) traits.push(p.loyalTreacherous > 0 ? `Trung(+${p.loyalTreacherous})` : `Phản(${p.loyalTreacherous})`);
    if (p.calmHot !== 0) traits.push(p.calmHot > 0 ? `Điềm Tĩnh(+${p.calmHot})` : `Nóng nảy(${p.calmHot})`);
    if (npc.personalityTraits?.length) traits.push(...npc.personalityTraits);
    
    if (traits.length > 0) lines.push(`      tính cách: ${traits.join(', ')}`);
  }

  // Ranh giới tri thức: NPC chỉ được hành xử theo những gì liệt kê ở đây.
  if (npc.knows && npc.knows.length) lines.push(`      biết: ${npc.knows.slice(0, 4).join('; ')}`);
  
  // Trí nhớ
  if (npc.memories && npc.memories.length) {
    const mems = npc.memories.slice(0, 3).map(m => `(T${m.turn}) ${m.event} [${m.emotion}]`);
    lines.push(`      nhớ: ${mems.join('; ')}`);
  }
  
  if (npc.unkeptPromises && npc.unkeptPromises.length) lines.push(`      hứa chưa giữ: ${npc.unkeptPromises.slice(0, 3).join('; ')}`);
  
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
