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

export const MORTAL_TIERS_DEMIGOD: Tier[] = [
  { name: 'Phàm Nhân', at: 0, desc: 'Dòng máu thần thánh chưa thức tỉnh' },
  { name: 'Thức Tỉnh', at: 60, desc: 'Sức mạnh vượt trội bộc phát' },
  { name: 'Anh Hùng Trẻ', at: 180, desc: 'Bắt đầu lập chiến công' },
  { name: 'Vang Danh', at: 450, desc: 'Chiến công lừng lẫy, vua chúa nể trọng' },
  { name: 'Bán Thần', at: 1000, desc: 'Kích hoạt hoàn toàn sức mạnh thần thánh' },
  { name: 'Huyền Thoại', at: 2200, desc: 'Tên tuổi trở thành thần thoại' },
  { name: 'Thánh Nhân / Tinh Tú', at: 4200, desc: 'Vượt qua phàm trần' },
  { name: 'Thần Linh Thực Thụ', at: 8000, desc: 'Chính thức bước vào đền thờ' },
];

export const MORTAL_TIERS_MAGE: Tier[] = [
  { name: 'Người Thường', at: 0, desc: 'Chưa cảm nhận được ma lực' },
  { name: 'Tập Sự', at: 60, desc: 'Sử dụng phép thuật cơ bản' },
  { name: 'Pháp Sư', at: 180, desc: 'Am hiểu nguyên tố, thi triển ma pháp trận' },
  { name: 'Đại Pháp Sư', at: 450, desc: 'Uy lực dời non lấp bể' },
  { name: 'Ma Đạo Sư', at: 1000, desc: 'Làm chủ bí thuật thượng thừa' },
  { name: 'Hiền Giả', at: 2200, desc: 'Tiếp cận bản chất của vạn vật' },
  { name: 'Bán Thần Phép Thuật', at: 4200, desc: 'Tạo lập quy luật ma pháp' },
  { name: 'Thần Ma Pháp', at: 8000, desc: 'Trở thành khái niệm ma thuật' },
];

export const MORTAL_TIERS_CYBERPUNK: Tier[] = [
  { name: 'Người Thường', at: 0, desc: 'Cơ thể sinh học thuần túy' },
  { name: 'Cấy Ghép Cơ Bản', at: 60, desc: 'Có linh kiện hỗ trợ' },
  { name: 'Tăng Cường Đặc Nhiệm', at: 180, desc: 'Khả năng chiến đấu vượt giới hạn' },
  { name: 'Cyborg Chiến Đấu', at: 450, desc: 'Vũ khí hạng nặng tích hợp' },
  { name: 'Vượt Quá Nhân Loại', at: 1000, desc: 'Não bộ kết nối trực tiếp với lõi hệ thống' },
  { name: 'Bóng Ma Mạng', at: 2200, desc: 'Cơ thể chỉ là vật chứa' },
  { name: 'Đấng Sáng Lập AI', at: 4200, desc: 'Dung hợp với mạng lưới toàn cầu' },
  { name: 'Thần Máy Móc', at: 8000, desc: 'Chi phối vạn vật bằng công nghệ' },
];

export const MORTAL_TIERS_KNIGHT: Tier[] = [
  { name: 'Lính Đánh Thuê', at: 0, desc: 'Kiếm sống qua ngày' },
  { name: 'Đội Trưởng', at: 60, desc: 'Chỉ huy một tiểu đội nhỏ' },
  { name: 'Hiệp Sĩ', at: 180, desc: 'Được phong tước, có lãnh địa nhỏ' },
  { name: 'Đại Hiệp Sĩ', at: 450, desc: 'Uy danh vang dội, tướng lĩnh tài ba' },
  { name: 'Nam Tước / Lãnh Chúa', at: 1000, desc: 'Cai quản một phương' },
  { name: 'Tướng Quân', at: 2200, desc: 'Thống lĩnh đại quân vương quốc' },
  { name: 'Quân Vương', at: 4200, desc: 'Lên ngôi hoàng đế, mở rộng bờ cõi' },
  { name: 'Đại Đế', at: 8000, desc: 'Thống nhất các lục địa, lưu danh thiên cổ' },
];

export function progressionLabel(path: GamePath, overrideLabel?: string, mortalClass?: string): string {
  if (overrideLabel && overrideLabel.trim()) return overrideLabel;
  if (path === 'creator') return 'Kỷ Nguyên Sáng Thế';
  if (path === 'god') return 'Thần Cấp';
  
  switch (mortalClass) {
    case 'Bán Thần / Anh Hùng': return 'Hành Trình Anh Hùng';
    case 'Ma Pháp Sư': return 'Bậc Ma Pháp';
    case 'Dị Nhân / Cơ Đốc': return 'Cấp Độ Nâng Cấp';
    case 'Kỵ Sĩ / Lãnh Chúa': return 'Thang Hiệp Sĩ / Danh Vọng';
    default: return 'Cảnh Giới Tu Luyện';
  }
}

export function deriveTier(path: GamePath, progress: number, override?: Tier[] | null, mortalClass?: string): TierState {
  let tiers = override && override.length >= 2 ? override : PATH_TIERS[path];
  
  if (!override || override.length < 2) {
    if (path === 'mortal') {
      switch (mortalClass) {
        case 'Bán Thần / Anh Hùng': tiers = MORTAL_TIERS_DEMIGOD; break;
        case 'Ma Pháp Sư': tiers = MORTAL_TIERS_MAGE; break;
        case 'Dị Nhân / Cơ Đốc': tiers = MORTAL_TIERS_CYBERPUNK; break;
        case 'Kỵ Sĩ / Lãnh Chúa': tiers = MORTAL_TIERS_KNIGHT; break;
        default: break;
      }
    }
  }

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
