/* ═══════════════════════════════════════════════════════
   MVU STATE RENDERER — Format state for AI consumption
   Renders stat_data into human-readable Vietnamese text
   so AI can "see" the current game state naturally.
   ═══════════════════════════════════════════════════════ */

import type { StatData, NpcData, EntityData } from './schema';
import { deriveAffinityStage } from './schema';
import { deriveTier, deriveMeters, progressionLabel } from '../mechanics/pathMechanics';

/**
 * Render the full state into a text block for injection into AI prompt.
 * Uses Vietnamese labels and natural language, not raw JSON.
 */
export function renderStateForAI(state: StatData): string {
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
  const tier = deriveTier(state.path, res.progress);
  const mechLines: string[] = [];
  mechLines.push(
    `${progressionLabel(state.path)}: ${tier.name} — ${tier.desc}`,
    tier.next != null
      ? `Tiến Trình: ${res.progress}/${tier.next} (${tier.pct}% tới "${tier.nextName}")`
      : `Tiến Trình: ${res.progress} (đã đạt đỉnh cao nhất)`,
  );
  for (const m of deriveMeters(state)) {
    mechLines.push(`${m.label}: ${m.value}${m.hint ? ` (${m.hint})` : ''}`);
  }
  sections.push(`\nCơ chế & Cấp bậc:\n  ${mechLines.join('\n  ')}`);

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
    sections.push(`\nMối quan hệ:\n${npcLines}`);
  }

  // ── Entities ──
  const entityEntries = Object.entries(state.entities);
  if (entityEntries.length > 0) {
    const entLines = entityEntries
      .slice(0, 10)
      .map(([id, ent]) => renderEntityCompact(id, ent))
      .join('\n');
    sections.push(`\nThực thể:\n${entLines}`);
    if (entityEntries.length > 10) {
      sections.push(`  ... và ${entityEntries.length - 10} thực thể khác`);
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

function renderNpcCompact(_id: string, npc: NpcData): string {
  const stage = deriveAffinityStage(npc.affinity);
  const status = npc.alive ? '' : ' [Đã Chết]';
  const role = npc.role ? ` — ${npc.role}` : '';
  return `  ${npc.name}${role}: ${stage} (${npc.affinity})${status}`;
}

function renderEntityCompact(_id: string, ent: EntityData): string {
  const status = ent.status !== 'active' ? ` [${ent.status}]` : '';
  return `  ${ent.name} (${ent.type}, Sức mạnh: ${ent.power})${status}`;
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
`.trim();
}
