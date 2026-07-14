/* ═══════════════════════════════════════════════════════
   PATH MECHANICS — Cơ chế chiều sâu cho từng con đường
   Chỉ số & tài nguyên thật sự CHI PHỐI lối chơi:
   - Tiến Trình (resources.progress) → cấp bậc theo path
   - Chỉ số phái sinh (Thần Lực, Chiến Lực, Cân Bằng...)
   - Luật số cụ thể để AI phát <UpdateVariable> tương ứng
   ═══════════════════════════════════════════════════════ */

import type { GamePath } from '@/components/creation/creationData';
import type { StatData } from '@/engine/mvu/schema';

export interface Tier { name: string; at: number; desc: string }
export interface TierState {
  index: number; name: string; desc: string;
  atCurrent: number; next: number | null; nextName: string | null; pct: number;
}
export interface Meter { key: string; label: string; value: number; hint?: string }

/* ── Thang cấp bậc theo Tiến Trình ── */
export const PATH_TIERS: Record<GamePath, Tier[]> = {
  creator: [
    { name: 'Hỗn Mang Sơ Khai', at: 0, desc: 'Chỉ có hư vô và ý chí đầu tiên' },
    { name: 'Khai Thiên', at: 120, desc: 'Tách sáng–tối, dựng khung vũ trụ' },
    { name: 'Lập Địa', at: 350, desc: 'Đất trời định hình, nguyên tố vận hành' },
    { name: 'Vạn Vật Sinh', at: 750, desc: 'Sự sống nảy nở khắp các cõi' },
    { name: 'Văn Minh Hưng', at: 1500, desc: 'Chủng loài lập nên văn minh, tín ngưỡng' },
    { name: 'Chư Thần Trị', at: 3200, desc: 'Thần linh do ngươi tạo cai quản vạn giới' },
    { name: 'Toàn Thịnh Vĩnh Hằng', at: 6500, desc: 'Đa vũ trụ vận hành hoàn mỹ dưới ý ngươi' },
  ],
  god: [
    { name: 'Tiểu Thần Vô Danh', at: 0, desc: 'Vừa thức tỉnh thần tính, chưa ai thờ' },
    { name: 'Thần Địa Phương', at: 100, desc: 'Một vùng nhỏ lập miếu thờ' },
    { name: 'Chính Thần', at: 320, desc: 'Được cả một xứ tôn thờ, có thần chức rõ ràng' },
    { name: 'Đại Thần', at: 800, desc: 'Danh vọng khắp đại lục, thần lực hùng hậu' },
    { name: 'Chủ Thần', at: 2000, desc: 'Đứng đầu một thần hệ, chi phối vận mệnh phàm giới' },
    { name: 'Thần Vương', at: 5000, desc: 'Quyền năng sánh ngang sáng thế, vạn thần quy phục' },
  ],
  mortal: [
    { name: 'Phàm Nhân', at: 0, desc: 'Thân thể phàm tục, chưa cảm ứng linh khí' },
    { name: 'Luyện Thể', at: 60, desc: 'Rèn gân cốt, sức vóc hơn người thường' },
    { name: 'Luyện Khí', at: 180, desc: 'Dẫn linh khí nhập thể, thi triển tiểu thuật' },
    { name: 'Trúc Cơ', at: 450, desc: 'Ngự khí phi hành, thọ nguyên kéo dài' },
    { name: 'Kim Đan', at: 1000, desc: 'Ngưng kim đan, pháp lực bội tăng' },
    { name: 'Nguyên Anh', at: 2200, desc: 'Nguyên anh xuất khiếu, thần niệm cương mãnh' },
    { name: 'Hóa Thần', at: 4200, desc: 'Lĩnh ngộ pháp tắc, dời non lấp bể' },
    { name: 'Phong Thần', at: 8000, desc: 'Vượt phàm thành thần, bước vào thần đạo' },
  ],
};

export function progressionLabel(path: GamePath, overrideLabel?: string): string {
  if (overrideLabel && overrideLabel.trim()) return overrideLabel;
  return path === 'creator' ? 'Kỷ Nguyên Sáng Thế'
    : path === 'god' ? 'Thần Cấp'
    : 'Cảnh Giới Tu Luyện';
}

export function deriveTier(path: GamePath, progress: number, override?: Tier[]): TierState {
  const tiers = override && override.length >= 2 ? override : PATH_TIERS[path];
  let index = 0;
  for (let i = 0; i < tiers.length; i++) if (progress >= tiers[i].at) index = i;
  const cur = tiers[index];
  const nextTier = tiers[index + 1] ?? null;
  const span = nextTier ? nextTier.at - cur.at : 1;
  const pct = nextTier ? Math.max(0, Math.min(100, Math.round(((progress - cur.at) / span) * 100))) : 100;
  return {
    index, name: cur.name, desc: cur.desc, atCurrent: cur.at,
    next: nextTier ? nextTier.at : null, nextName: nextTier ? nextTier.name : null, pct,
  };
}

const attr = (s: StatData, k: string): number => s.attributes[k] ?? 0;

/** Chỉ số phái sinh — tính từ thuộc tính + tài nguyên sống */
export function deriveMeters(state: StatData): Meter[] {
  const r = state.resources;
  switch (state.path) {
    case 'creator':
      return [
        { key: 'balance', label: 'Cân Bằng Vũ Trụ', value: attr(state, 'order') - attr(state, 'chaos'), hint: 'Trật Tự − Hỗn Mang' },
        { key: 'genesis', label: 'Thiên Uy', value: attr(state, 'creation') - attr(state, 'destruction'), hint: 'Sáng Tạo − Hủy Diệt' },
      ];
    case 'god':
      return [
        { key: 'divineForce', label: 'Thần Lực Tổng', value: Math.round(attr(state, 'divineForce') + r.faith * 1.2 + r.followers / 200), hint: 'Thần lực + Tín ngưỡng + Tín đồ' },
        { key: 'worship', label: 'Sùng Kính', value: r.faith, hint: 'Tín ngưỡng /100' },
      ];
    default: // mortal
      return [
        { key: 'combat', label: 'Chiến Lực', value: Math.round(attr(state, 'strength') + attr(state, 'constitution') * 0.5 + Math.max(0, attr(state, 'cultivation')) * 0.6), hint: 'Võ Lực + Thể Chất + Linh Căn' },
        { key: 'root', label: 'Linh Căn', value: attr(state, 'cultivation'), hint: 'Tiềm năng tu luyện' },
      ];
  }
}

/* ── Luật số cụ thể cho AI (đưa vào system prompt) ── */
export function staticRules(path: GamePath): string {
  const common = `
CHỈ SỐ LÀ LUẬT (không chỉ để trang trí):
- Mỗi hành động có hệ quả SỐ HỌC. Sau lời kể, PHÁT <UpdateVariable> khớp với những gì đã xảy ra.
- Tài nguyên KHÔNG đủ → hành động thất bại/dang dở, và vẫn hao tổn một phần.
- Thưởng "resources.progress" cho tiến triển quan trọng → đủ ngưỡng thì mô tả lên cấp bậc mới.`.trim();

  switch (path) {
    case 'creator':
      return `
=== CƠ CHẾ SÁNG THẾ THẦN ===
${common}
- QUYỀN NĂNG (resources.power) là nhiên liệu sáng tạo. Chi phí gợi ý mỗi lần sáng tạo:
  · chi tiết nhỏ/tinh chỉnh: 10–30   · một loài/sinh mệnh: 50–150
  · một thế giới/quy luật: 200–500   · một vũ trụ/vị thần: 600–1500
  → phát {"op":"delta","path":"resources.power","value": -X}. Nghỉ ngơi/hấp thu có thể HỒI power (+).
- TIẾN TRÌNH: hành động khai sáng lớn thưởng +10..+120 progress: {"op":"delta","path":"resources.progress","value":+X}.
- THƯỚC ĐO CÂN BẰNG VŨ TRỤ (Trật Tự − Hỗn Mang):
  · Lệch Hỗn Mang (<-30): Tăng tốc độ sinh sôi của các loài dị dị/quái vật, giảm cost Sáng Tạo 20%, nhưng dễ mất kiểm soát (Tạo vật có thể phản loạn, cắn trả).
  · Lệch Trật Tự (>30): Tạo vật quy củ, vâng lời, dễ phát triển văn minh, nhưng tiêu hao Quyền Năng (Power) nhiều hơn 20% khi muốn tạo ra sự đột phá.
  · Cân bằng (-30 đến 30): Vạn vật phát triển hài hòa.
- THƯỚC ĐO THIÊN UY (Sáng Tạo - Hủy Diệt):
  · Quá thiên về Hủy Diệt: Trở thành Ác Thần, các hành động hủy diệt hồi lại Quyền Năng, sinh linh khiếp sợ.
  · Quá thiên về Sáng Tạo: Trở thành Đấng Tạo Hóa thuần túy, tuy nhiên các mầm mống hủy diệt tiềm ẩn sẽ tự phát sinh thành quái vật.
- Ý CHÍ TỰ DO: sinh mệnh/thần do ngươi tạo có "power" và "loyalty". Loyalty thấp + power cao → có thể phản loạn (cập nhật entities.*.loyalty, tạo quest/xung đột).
- Ghi tạo vật lớn vào sổ: {"op":"insert","path":"entities","key":"<slug>","value":{"name":"...","type":"realm|creature|god|artifact|concept","power":N,"description":"..."}}.

GHI VÀO XƯỞNG SÁNG THẾ (tự động, KHÔNG cần người chơi bấm tay):
Khi ngươi sáng tạo một thứ đáng lưu vào Xưởng — thế giới, hệ sức mạnh, chủng loài, vật liệu, tạo vật, tín ngưỡng, quy luật, sự kiện vũ trụ, hoặc thần hệ — hãy THÊM khối <StudioCreate> ở cuối (sau <UpdateVariable>). Khối này BỊ ẨN khỏi người chơi.
Định dạng:
<StudioCreate>
{"category":"<world|law|material|power|species|artifact|faith|cosmic_event|divine_hierarchy>","name":"...","tagline":"một câu bản chất","fields":{ ...vài trường chính... }}
</StudioCreate>
Ví dụ trường chính theo loại: world→{type,scale,environment}; power→{paradigm,energy,mechanism}; cosmic_event→{era,impact,participants}; divine_hierarchy→{pantheon,roles,domains}.
Chỉ dùng giá trị chuỗi/mảng chuỗi cho fields.
- Tạo MỚI: ghi một lần khi thực thể lần đầu xuất hiện.
- CẬP NHẬT/tiến hóa thực thể đã có: phát lại <StudioCreate> với ĐÚNG "category" và "name" cũ, chỉ kèm các trường thay đổi/bổ sung — hệ thống sẽ hợp nhất, không tạo trùng.`.trim();

    case 'god':
      return `
=== CƠ CHẾ THẦN ===
${common}
- THẦN LỰC dựa vào TÍN ĐỒ (resources.followers) và TÍN NGƯỠNG (resources.faith /100). Đây là gốc rễ sức mạnh.
- Mỗi phép lạ/can thiệp phàm giới tốn QUYỀN NĂNG (resources.power) 20–200 tùy quy mô → delta power âm.
- TÍN NGƯỠNG bào mòn theo thời gian: nếu vài lượt không có sùng bái/kỳ tích, giảm {"op":"delta","path":"resources.faith","value":-1..-3}. Kỳ tích/đền thờ mới → tăng faith.
- Thu phục tín đồ: {"op":"delta","path":"resources.followers","value":+N}. Mất niềm tin → followers & faith âm.
- TIẾN TRÌNH thần cấp tăng theo tín đồ, đền thờ, kỳ tích (+10..+100 progress). Đủ ngưỡng → thăng cấp thần.
- CHÍNH TRỊ THẦN GIỚI: các thần khác (npcs) liên minh/tranh đoạt tín đồ/phản bội — cập nhật npcs.*.affinity & loyalty.`.trim();

    default: // mortal
      return `
=== CƠ CHẾ PHÀM NHÂN ===
${common}
- TU LUYỆN: CẢNH GIỚI dựa vào resources.progress. Tu luyện/kỳ ngộ/đột phá thưởng +5..+80 progress. Đủ ngưỡng = ĐỘT PHÁ (mô tả vượt kiếp/bình cảnh, có thể thất bại nếu nóng vội).
- LINH CĂN (attributes.cultivation) quyết tốc độ: cao → tiến nhanh; thấp/âm → chật vật, dễ tẩu hỏa.
- KHÔNG vượt cấp phi lý: không thể một mình hạ cường giả hơn nhiều cảnh giới nếu không có kỳ duyên/pháp bảo.
- SINH TỒN THỰC TẾ: bị thương, mất mát, nợ nần phản ánh qua chỉ số & tài nguyên (wealth, danh tiếng world.reputation). Hành động nguy hiểm có rủi ro THẬT (có thể mất mát vĩnh viễn).
- Cơ duyên: gặp cao nhân/bí cảnh/công pháp → cập nhật abilities, entities (pháp bảo), hoặc npcs.`.trim();
  }
}
