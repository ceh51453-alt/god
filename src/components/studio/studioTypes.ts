/* ═══════════════════════════════════════════════════════
   XƯỞNG SÁNG THẾ — Schema-driven Creation System
   Mọi tạo vật (thế giới, sức mạnh, vật liệu, sinh vật,
   trang bị, tín ngưỡng, quy luật) đều là một StudioEntity
   thuộc một Category. Category định nghĩa các Field.
   ═══════════════════════════════════════════════════════ */

export type CategoryId =
  | 'world'      // Thế Giới / Cảnh Giới
  | 'law'        // Quy Luật Nền Tảng
  | 'material'   // Nguyên Tố & Vật Liệu
  | 'power'      // Hệ Thống Sức Mạnh
  | 'species'    // Sinh Vật & Tiến Hóa
  | 'artifact'   // Tạo Vật & Trang Bị
  | 'faith';     // Tín Ngưỡng

export type FieldType =
  | 'text'       // 1 dòng
  | 'textarea'   // nhiều dòng
  | 'select'     // 1 lựa chọn
  | 'tags'       // chip tự do (có gợi ý)
  | 'stats'      // nhóm thanh trượt có tên
  | 'sublist'    // danh sách hàng lặp lại (vật liệu cấu thành)
  | 'graph'      // cây/đồ thị node (tiến hóa, cảnh giới)
  | 'relations'; // liên kết tới tạo vật khác

export interface StatDef {
  key: string;
  label: string;
  min: number;
  max: number;
  def: number;
}

export interface FieldOption {
  value: string;
  hint?: string;
}

export interface SublistCols {
  title: string;            // cột chính (bắt buộc)
  meta?: string;            // cột phụ (vd: điều kiện / tỉ lệ)
  detail?: string;          // mô tả dài
  numeric?: string;         // cột số (vd: cấp sức mạnh)
  addLabel?: string;        // nhãn nút thêm
}

export interface GraphConfig {
  mode?: 'tree' | 'chain';  // tree: nhánh song song · chain: chuỗi tuần tự
  titleLabel?: string;      // nhãn ô tiêu đề node
  metaLabel?: string;       // nhãn ô điều kiện/biểu hiện
  detailLabel?: string;     // nhãn ô mô tả
  numeric?: string;         // nhãn ô số (vd: sức mạnh)
  addLabel?: string;        // nhãn nút thêm node
  rootHint?: string;        // gợi ý node gốc
}

export interface GraphNode {
  id: string;
  parent: string | null;    // null = nhánh trực tiếp từ gốc (bản thể)
  title: string;
  meta: string;
  detail: string;
  num?: number;
}

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  hint?: string;
  placeholder?: string;
  full?: boolean;                 // chiếm cả hàng trong lưới
  options?: FieldOption[];        // select
  suggestions?: string[];         // tags
  stats?: StatDef[];              // stats
  cols?: SublistCols;             // sublist
  graph?: GraphConfig;            // graph
  relationTo?: CategoryId;        // relations
}

export interface PresetDef {
  name: string;
  values: Record<string, FieldValueInit>;
}

export interface CategoryDef {
  id: CategoryId;
  name: string;        // "Thế Giới"
  plural: string;      // dùng cho tiêu đề danh mục
  glyph: string;       // key icon (map trong .tsx)
  accent: string;      // màu nhấn (hex)
  tagline: string;     // mô tả ngắn
  nameLabel: string;   // nhãn ô tên
  namePlaceholder: string;
  decreeNoun: string;  // danh từ trong "lời tuyên": "một THẾ GIỚI"
  fields: FieldDef[];
  presets: PresetDef[];
}

/* ── Kiểu giá trị field ── */

export interface SubItem {
  title: string;
  meta: string;
  detail: string;
  num?: number;
}

export type FieldValue = string | string[] | Record<string, number> | SubItem[] | GraphNode[];
// Giá trị khởi tạo trong preset (cho phép bỏ trống các cột)
export type FieldValueInit = string | string[] | Record<string, number> | Partial<SubItem>[];

export interface StudioEntity {
  id: string;
  category: CategoryId;
  name: string;
  values: Record<string, FieldValue>;
  createdAt: number;
  updatedAt: number;
}

/* ═══════════════════════════════════════════════════════
   Lựa chọn dùng chung
   ═══════════════════════════════════════════════════════ */

const RARITY: FieldOption[] = [
  { value: 'Phàm Phẩm', hint: 'Vật chất tầm thường, khắp nơi đều có' },
  { value: 'Linh Phẩm', hint: 'Bắt đầu chứa linh khí, quý hiếm' },
  { value: 'Bảo Phẩm', hint: 'Trân bảo, tông môn tranh đoạt' },
  { value: 'Tiên Phẩm', hint: 'Chỉ tồn tại nơi tiên cảnh' },
  { value: 'Thần Phẩm', hint: 'Do thần linh rèn đúc, kinh thiên động địa' },
  { value: 'Hỗn Độn Phẩm', hint: 'Sinh ra từ trước cả vũ trụ' },
];

const SCALE: FieldOption[] = [
  { value: 'Cục Bộ' }, { value: 'Vùng' }, { value: 'Đại Lục' },
  { value: 'Hành Tinh' }, { value: 'Thiên Hà' }, { value: 'Vũ Trụ' }, { value: 'Đa Vũ Trụ' },
];

/* ═══════════════════════════════════════════════════════
   ĐỊNH NGHĨA 7 PHÂN HỆ
   ═══════════════════════════════════════════════════════ */

export const CATEGORIES: CategoryDef[] = [
  /* ───────────── 1. THẾ GIỚI ───────────── */
  {
    id: 'world',
    name: 'Thế Giới',
    plural: 'Các Thế Giới',
    glyph: 'world',
    accent: '#4a8fa8',
    tagline: 'Khai sinh vũ trụ, cảnh giới, tinh cầu — nơi mọi tạo vật an trú.',
    nameLabel: 'Tên thế giới',
    namePlaceholder: 'vd: Cửu Trọng Thiên, Địa Cầu Nguyên Thủy...',
    decreeNoun: 'một THẾ GIỚI',
    fields: [
      { id: 'tagline', label: 'Bản chất', type: 'text', full: true, placeholder: 'Một câu tóm gọn linh hồn của thế giới này...' },
      { id: 'type', label: 'Loại hình', type: 'select', options: [
        { value: 'Vũ Trụ Vật Chất' }, { value: 'Thiên Giới' }, { value: 'Nhân Gian' },
        { value: 'Địa Ngục / Minh Giới' }, { value: 'Nguyên Tố Giới' }, { value: 'Tinh Cầu' },
        { value: 'Không Gian Bỏ Túi' }, { value: 'Mộng Cảnh / Tinh Thần Giới' },
      ]},
      { id: 'scale', label: 'Quy mô', type: 'select', options: SCALE },
      { id: 'timeFlow', label: 'Dòng chảy thời gian', type: 'text', placeholder: 'vd: 1 ngày ngoài = 1 năm trong' },
      { id: 'environment', label: 'Địa hình & Khí hậu', type: 'textarea', full: true, placeholder: 'Lục địa bay lơ lửng, biển mây, mặt trời đôi...' },
      { id: 'dominant', label: 'Nguyên tố / Vật liệu chủ đạo', type: 'relations', relationTo: 'material', hint: 'Chọn từ Nguyên Tố & Vật Liệu đã tạo' },
      { id: 'laws', label: 'Quy luật vận hành', type: 'relations', relationTo: 'law' },
      { id: 'inhabitants', label: 'Chủng loài cư ngụ', type: 'relations', relationTo: 'species' },
      { id: 'planes', label: 'Cấu trúc tầng / cõi', type: 'graph', full: true, graph: {
        mode: 'tree', titleLabel: 'Tầng / Cõi', metaLabel: 'Vị trí / lối vào',
        detailLabel: 'Cảnh quan & cư dân', addLabel: 'Thêm tầng / cõi', rootHint: 'Cõi gốc',
      }},
      { id: 'lore', label: 'Truyền thuyết khởi nguyên', type: 'textarea', full: true },
    ],
    presets: [
      { name: 'Cửu Trọng Thiên', values: {
        tagline: 'Chín tầng trời chồng lên nhau, càng cao linh khí càng đậm.',
        type: 'Thiên Giới', scale: 'Vũ Trụ', timeFlow: '1 ngày thiên giới = 1 năm hạ giới',
        environment: 'Chín tầng mây bậc thang, mỗi tầng một cảnh sắc, cầu vồng nối liền các thiên cung.',
        planes: [
          { title: 'Hạ Thiên (Tầng 1-3)', meta: 'Ngay trên nhân gian', detail: 'Tiểu thần & tiên nhân sơ nhập, linh khí mỏng' },
          { title: 'Trung Thiên (Tầng 4-6)', meta: 'Qua Nam Thiên Môn', detail: 'Cung điện mây của chính thần, linh khí đậm đặc' },
          { title: 'Thượng Thiên (Tầng 7-9)', meta: 'Chỉ chủ thần lên nổi', detail: 'Nơi ngự của Thiên Đế, quy luật gốc hiển lộ' },
        ],
      }},
      { name: 'Tinh Cầu Lam', values: {
        tagline: 'Một hành tinh nước xanh biếc, sự sống bùng nổ trong đại dương.',
        type: 'Tinh Cầu', scale: 'Hành Tinh',
        environment: 'Ba phần tư là biển, lục địa trôi dạt, khí quyển giàu dưỡng khí.',
      }},
      { name: 'Hư Không Tàn Giới', values: {
        tagline: 'Tàn tích của một vũ trụ đã chết, trôi nổi trong hư vô.',
        type: 'Không Gian Bỏ Túi', scale: 'Vùng',
        environment: 'Những mảnh lục địa vỡ, trọng lực đảo lộn, ánh sáng le lói từ sao đã tắt.',
      }},
    ],
  },

  /* ───────────── 2. QUY LUẬT ───────────── */
  {
    id: 'law',
    name: 'Quy Luật',
    plural: 'Quy Luật Nền Tảng',
    glyph: 'law',
    accent: '#7b9ec7',
    tagline: 'Luật lệ tối cao chi phối thực tại: nhân quả, thời không, sinh tử, cấm kỵ.',
    nameLabel: 'Tên quy luật',
    namePlaceholder: 'vd: Luật Cân Bằng Đẳng Giá, Vòng Luân Hồi...',
    decreeNoun: 'một QUY LUẬT NỀN TẢNG',
    fields: [
      { id: 'tagline', label: 'Tuyên ngôn', type: 'text', full: true, placeholder: 'Phát biểu quy luật trong một câu bất biến...' },
      { id: 'domain', label: 'Phạm trù', type: 'select', options: [
        { value: 'Vật Lý & Năng Lượng' }, { value: 'Nhân Quả' }, { value: 'Thời Gian' },
        { value: 'Không Gian' }, { value: 'Sinh Tử & Linh Hồn' }, { value: 'Sức Mạnh & Tu Luyện' },
        { value: 'Cấm Kỵ / Nghịch Thiên' },
      ]},
      { id: 'scope', label: 'Phạm vi hiệu lực', type: 'select', options: [
        { value: 'Toàn Bộ Tồn Tại' }, { value: 'Một Vũ Trụ' }, { value: 'Một Thế Giới' }, { value: 'Cục Bộ' },
      ]},
      { id: 'immutable', label: 'Tính bất biến', type: 'select', options: [
        { value: 'Tuyệt đối — không gì phá nổi' }, { value: 'Có thể lách qua kẽ hở' },
        { value: 'Có thể bị cường giả bẻ gãy' },
      ]},
      { id: 'effect', label: 'Cơ chế vận hành', type: 'textarea', full: true, placeholder: 'Quy luật này ảnh hưởng thế giới ra sao?' },
      { id: 'exception', label: 'Ngoại lệ & Kẽ hở', type: 'textarea', full: true },
      { id: 'penalty', label: 'Hình phạt khi phạm luật', type: 'textarea', full: true, placeholder: 'Kẻ nghịch thiên phải trả giá gì?' },
      { id: 'clauses', label: 'Điều khoản & Ngoại lệ', type: 'graph', full: true, graph: {
        mode: 'tree', titleLabel: 'Điều khoản', metaLabel: 'Điều kiện áp dụng',
        detailLabel: 'Hiệu lực cụ thể', addLabel: 'Thêm điều khoản', rootHint: 'Nguyên tắc gốc',
      }},
    ],
    presets: [
      { name: 'Luật Cân Bằng Đẳng Giá', values: {
        tagline: 'Muốn đạt được thứ gì, phải trả một cái giá tương xứng.',
        domain: 'Nhân Quả', scope: 'Toàn Bộ Tồn Tại', immutable: 'Tuyệt đối — không gì phá nổi',
        effect: 'Mọi phép thuật, sáng tạo đều tiêu hao vật chất/năng lượng tương đương. Không có gì sinh ra từ hư vô.',
        penalty: 'Kẻ cố lấy nhiều hơn cái giá bỏ ra sẽ bị chính quy luật thu hồi phần thân thể hoặc linh hồn tương ứng.',
        clauses: [
          { title: 'Bảo toàn tổng lượng', meta: 'Mọi sáng tạo / phép thuật', detail: 'Tổng vật chất-năng lượng của vũ trụ không đổi' },
          { title: 'Ngoại lệ Hỗn Độn Phẩm', meta: 'Vật chất cấp Hỗn Độn', detail: 'Được sinh một lượng nhỏ từ hư vô' },
          { title: 'Nợ đẳng giá', meta: 'Lấy trước trả sau', detail: 'Được vay, nhưng lãi tính bằng thọ nguyên / linh hồn' },
        ],
      }},
      { name: 'Vòng Luân Hồi', values: {
        tagline: 'Không linh hồn nào thực sự chết; chúng tái sinh theo nghiệp lực.',
        domain: 'Sinh Tử & Linh Hồn', scope: 'Một Vũ Trụ', immutable: 'Có thể lách qua kẽ hở',
        effect: 'Khi chết, linh hồn trở về Luân Hồi Trì, gột rửa ký ức rồi đầu thai theo thiện/ác đã gây.',
        exception: 'Kẻ đạt Bất Tử hoặc bị phong ấn linh hồn có thể thoát khỏi vòng luân hồi.',
      }},
      { name: 'Thiên Đạo Áp Chế', values: {
        tagline: 'Càng mạnh, trời càng đố kỵ; vượt giới hạn sẽ chịu thiên kiếp.',
        domain: 'Sức Mạnh & Tu Luyện', scope: 'Một Thế Giới', immutable: 'Có thể bị cường giả bẻ gãy',
        effect: 'Mỗi lần đột phá cảnh giới lớn, tu sĩ phải vượt qua lôi kiếp do Thiên Đạo giáng xuống.',
        penalty: 'Vượt kiếp thất bại: hồn phi phách tán, đạo cơ tan vỡ.',
      }},
    ],
  },

  /* ───────────── 3. NGUYÊN TỐ & VẬT LIỆU ───────────── */
  {
    id: 'material',
    name: 'Vật Liệu',
    plural: 'Nguyên Tố & Vật Liệu',
    glyph: 'material',
    accent: '#a8844a',
    tagline: 'Chất liệu nền của vạn vật: nguyên tố, kim loại, tinh thể, linh vật chất.',
    nameLabel: 'Tên vật liệu',
    namePlaceholder: 'vd: Tinh Thể Hỗn Độn, Huyền Thiết, Long Cốt...',
    decreeNoun: 'một loại VẬT LIỆU / NGUYÊN TỐ',
    fields: [
      { id: 'tagline', label: 'Bản chất', type: 'text', full: true },
      { id: 'class', label: 'Phân loại', type: 'select', options: [
        { value: 'Nguyên Tố Cơ Bản' }, { value: 'Kim Loại' }, { value: 'Tinh Thể / Khoáng' },
        { value: 'Hữu Cơ / Sinh Chất' }, { value: 'Linh Vật Chất' }, { value: 'Năng Lượng Thuần' }, { value: 'Hư Vô Chất' },
      ]},
      { id: 'rarity', label: 'Phẩm cấp', type: 'select', options: RARITY },
      { id: 'stats', label: 'Đặc tính vật lý', type: 'stats', stats: [
        { key: 'hardness', label: 'Độ Cứng', min: 0, max: 100, def: 40 },
        { key: 'spirit', label: 'Linh Tính', min: 0, max: 100, def: 30 },
        { key: 'durability', label: 'Độ Bền', min: 0, max: 100, def: 50 },
        { key: 'purity', label: 'Độ Tinh Khiết', min: 0, max: 100, def: 50 },
        { key: 'energy', label: 'Hàm Lượng Năng Lượng', min: 0, max: 100, def: 20 },
      ]},
      { id: 'properties', label: 'Thuộc tính đặc biệt', type: 'tags', suggestions: [
        'Bất hoại', 'Tự tái sinh', 'Dẫn linh', 'Hút năng lượng', 'Phản ma pháp',
        'Nhẹ như lông', 'Biến hình', 'Phát sáng', 'Cách nhiệt tuyệt đối', 'Khắc chế linh hồn',
      ]},
      { id: 'source', label: 'Nguồn gốc / Nơi khai thác', type: 'text', full: true, placeholder: 'Lõi sao băng, mạch ngầm núi lửa, xác thần thú...' },
      { id: 'refine', label: 'Chuỗi tinh luyện', type: 'graph', full: true, graph: {
        mode: 'chain', titleLabel: 'Dạng / Cấp luyện', metaLabel: 'Phương pháp chế',
        detailLabel: 'Tính chất mới', numeric: 'Phẩm', addLabel: 'Thêm cấp luyện', rootHint: 'Quặng thô',
      }},
      { id: 'lore', label: 'Ghi chú & Truyền thuyết', type: 'textarea', full: true },
    ],
    presets: [
      { name: 'Tinh Thể Hỗn Độn', values: {
        tagline: 'Kết tinh của năng lượng nguyên thủy, chứa mọi khả năng.',
        class: 'Hư Vô Chất', rarity: 'Hỗn Độn Phẩm',
        stats: { hardness: 90, spirit: 100, durability: 100, purity: 80, energy: 100 },
        properties: ['Bất hoại', 'Hút năng lượng', 'Biến hình'],
        source: 'Chỉ hình thành nơi ranh giới giữa hư vô và tồn tại.',
      }},
      { name: 'Huyền Thiết', values: {
        tagline: 'Kim loại đen tuyền nặng trịch, rèn khí giới sắc như thần binh.',
        class: 'Kim Loại', rarity: 'Bảo Phẩm',
        stats: { hardness: 85, spirit: 40, durability: 80, purity: 60, energy: 15 },
        properties: ['Dẫn linh', 'Cách nhiệt tuyệt đối'],
        source: 'Mạch quặng sâu dưới lòng núi lửa đã tắt ngàn năm.',
        refine: [
          { title: 'Quặng Huyền Thiết', meta: 'Khai thác thô', detail: 'Nặng, lẫn nhiều tạp chất', num: 1 },
          { title: 'Huyền Thiết Tinh', meta: 'Luyện lửa tam muội 49 ngày', detail: 'Loại tạp, dẫn linh tốt hơn hẳn', num: 3 },
          { title: 'Huyền Thiết Mẫu', meta: 'Ngâm long huyết trăm năm', detail: 'Tự phục hồi, đủ phẩm rèn thần binh', num: 5 },
        ],
      }},
      { name: 'Long Cốt', values: {
        tagline: 'Xương của rồng cổ, vẫn còn cuộn tàn dư của long uy.',
        class: 'Hữu Cơ / Sinh Chất', rarity: 'Tiên Phẩm',
        stats: { hardness: 70, spirit: 90, durability: 75, purity: 70, energy: 85 },
        properties: ['Dẫn linh', 'Khắc chế linh hồn', 'Tự tái sinh'],
        source: 'Di cốt của Thượng Cổ Chân Long nơi long trủng.',
      }},
    ],
  },

  /* ───────────── 4. HỆ THỐNG SỨC MẠNH ───────────── */
  {
    id: 'power',
    name: 'Sức Mạnh',
    plural: 'Hệ Thống Sức Mạnh',
    glyph: 'power',
    accent: '#9b6bbf',
    tagline: 'Cách vạn vật đạt và dùng sức mạnh: ma thuật, tu tiên, khoa học, thần lực.',
    nameLabel: 'Tên hệ thống',
    namePlaceholder: 'vd: Tu Tiên Đạo, Ma Pháp Nguyên Tố, Cơ Giáp Học...',
    decreeNoun: 'một HỆ THỐNG SỨC MẠNH',
    fields: [
      { id: 'tagline', label: 'Bản chất', type: 'text', full: true },
      { id: 'paradigm', label: 'Trường phái', type: 'select', options: [
        { value: 'Ma Thuật', hint: 'Điều khiển mana/nguyên tố qua chú văn, ấn quyết' },
        { value: 'Tu Tiên', hint: 'Hấp thu linh khí, luyện thể ngưng đan, phi thăng' },
        { value: 'Khoa Học', hint: 'Công nghệ, năng lượng, cơ giới, quy luật tự nhiên' },
        { value: 'Thần Lực', hint: 'Quyền năng thần thánh từ chức phận & đức tin' },
        { value: 'Dị Năng', hint: 'Năng lực bẩm sinh, đột biến, siêu nhiên' },
        { value: 'Đấu Khí / Võ Đạo', hint: 'Rèn thể xác, đấu khí, khí công' },
      ]},
      { id: 'energy', label: 'Nguồn năng lượng', type: 'text', full: true, placeholder: 'Linh khí, mana, đức tin, ATP, nguyên tử...' },
      { id: 'mechanism', label: 'Cơ chế vận hành', type: 'textarea', full: true, placeholder: 'Người dùng đạt và thi triển sức mạnh này thế nào?' },
      { id: 'cost', label: 'Cái giá phải trả', type: 'textarea', full: true, placeholder: 'Tiêu hao, tác dụng phụ, rủi ро...' },
      { id: 'tiers', label: 'Thang cảnh giới', type: 'graph', full: true, graph: {
        mode: 'chain', titleLabel: 'Tên cảnh giới', metaLabel: 'Biểu hiện',
        detailLabel: 'Năng lực đạt được', numeric: 'Sức mạnh', addLabel: 'Thêm cảnh giới',
        rootHint: 'Người chưa nhập môn',
      }},
      { id: 'strengths', label: 'Ưu thế', type: 'textarea' },
      { id: 'weakness', label: 'Khắc chế / Điểm yếu', type: 'textarea' },
    ],
    presets: [
      { name: 'Tu Tiên Đạo', values: {
        tagline: 'Đoạt thiên địa linh khí, nghịch thiên cải mệnh, cầu trường sinh.',
        paradigm: 'Tu Tiên', energy: 'Linh khí trời đất, đan dược, linh thạch',
        mechanism: 'Hấp thu linh khí qua hô hấp, tụ tại đan điền, mở kinh mạch, ngưng thành kim đan rồi hóa nguyên anh.',
        cost: 'Tẩu hỏa nhập ma nếu nóng vội; mỗi đại cảnh giới phải vượt thiên kiếp; tài nguyên khan hiếm.',
        tiers: [
          { title: 'Luyện Khí', meta: '13 tầng', detail: 'Cảm ứng linh khí, cường hóa thể chất', num: 10 },
          { title: 'Trúc Cơ', meta: 'Sơ/Trung/Hậu kỳ', detail: 'Ngự kiếm phi hành, thọ 200 năm', num: 25 },
          { title: 'Kim Đan', meta: 'Kết đan', detail: 'Ngưng kim đan, pháp thuật uy lực bội tăng', num: 45 },
          { title: 'Nguyên Anh', meta: 'Xuất khiếu', detail: 'Nguyên anh bất diệt, thần niệm cương hóa', num: 65 },
          { title: 'Hóa Thần', meta: 'Phi thăng tiền', detail: 'Lĩnh ngộ pháp tắc, dời non lấp bể', num: 85 },
        ],
        weakness: 'Kim đan/nguyên anh bị hủy thì tu vi tan; cảnh giới thấp khó địch cao.',
      }},
      { name: 'Ma Pháp Nguyên Tố', values: {
        tagline: 'Khắc chú văn, dệt mana thành lửa, băng, sấm, gió theo ý chí.',
        paradigm: 'Ma Thuật', energy: 'Mana trong không khí & lõi ma lực của thuật sĩ',
        mechanism: 'Đọc thần chú, vẽ ma trận, dẫn mana qua mạch ma lực để cấu trúc phép thuật nguyên tố.',
        cost: 'Cạn mana gây choáng/hôn mê; phản phệ nếu ma trận sai lệch.',
        tiers: [
          { title: 'Kiến Tập', meta: 'Vòng 1', detail: 'Thắp lửa, tạo nước, chiêu sáng', num: 12 },
          { title: 'Pháp Sư', meta: 'Vòng 3', detail: 'Cầu lửa, giáp băng, dịch chuyển ngắn', num: 35 },
          { title: 'Đại Pháp Sư', meta: 'Vòng 6', detail: 'Bão sấm, tường thành băng, triệu hồi', num: 60 },
          { title: 'Hiền Giả', meta: 'Vòng 9', detail: 'Thao túng quy luật nguyên tố ở diện rộng', num: 90 },
        ],
        weakness: 'Cần thời gian niệm chú; bị ngắt quãng thì phép hỏng; khắc hệ tương sinh tương khắc.',
      }},
      { name: 'Cơ Giáp Học', values: {
        tagline: 'Không cần thiên phú — trí tuệ và công nghệ san bằng mọi khoảng cách.',
        paradigm: 'Khoa Học', energy: 'Lõi phản ứng, điện, nhiên liệu tổng hợp',
        mechanism: 'Nghiên cứu, chế tạo cơ giáp/vũ khí, nâng cấp qua bản thiết kế và tài nguyên.',
        cost: 'Tốn tài nguyên & thời gian nghiên cứu; hỏng hóc; phụ thuộc hậu cần.',
        tiers: [
          { title: 'Thợ Học Việc', meta: 'Cấp T1', detail: 'Chế công cụ, vũ khí thô sơ', num: 8 },
          { title: 'Kỹ Sư', meta: 'Cấp T3', detail: 'Cơ giáp ngoại khung, súng năng lượng', num: 40 },
          { title: 'Bậc Thầy Cơ Khí', meta: 'Cấp T5', detail: 'Cơ giáp chiến, AI phụ trợ', num: 70 },
          { title: 'Kiến Trúc Sư Văn Minh', meta: 'Cấp T7', detail: 'Vũ khí quỹ đạo, phi thuyền, năng lượng vô hạn', num: 95 },
        ],
        weakness: 'Xung điện từ; thiếu năng lượng; đối thủ siêu nhiên vượt vật lý.',
      }},
    ],
  },

  /* ───────────── 5. SINH VẬT & TIẾN HÓA ───────────── */
  {
    id: 'species',
    name: 'Sinh Vật',
    plural: 'Sinh Vật & Tiến Hóa',
    glyph: 'species',
    accent: '#6aaa72',
    tagline: 'Nặn ra sự sống từ tế bào tới linh hồn, rồi chọn hướng tiến hóa cho chúng.',
    nameLabel: 'Tên chủng loài',
    namePlaceholder: 'vd: Nguyên Bào Thủy Tổ, Yêu Lang Tộc, Tinh Linh...',
    decreeNoun: 'một CHỦNG LOÀI SINH VẬT',
    fields: [
      { id: 'tagline', label: 'Bản chất', type: 'text', full: true },
      { id: 'basis', label: 'Cơ sở sự sống', type: 'select', options: [
        { value: 'Tế Bào (Carbon)', hint: 'Sinh học như Trái Đất' },
        { value: 'Silicon / Khoáng Vật' }, { value: 'Năng Lượng Thuần' },
        { value: 'Linh Hồn / Tinh Thần' }, { value: 'Cơ Giới / Nhân Tạo' },
        { value: 'Nguyên Tố' }, { value: 'Hỗn Hợp' },
      ]},
      { id: 'kingdom', label: 'Giới / Chủng', type: 'select', options: [
        { value: 'Vi Sinh Vật' }, { value: 'Thực Vật' }, { value: 'Động Vật' },
        { value: 'Linh Thú / Yêu Thú' }, { value: 'Nhân Hình' }, { value: 'Thần Tộc' }, { value: 'Nhân Tạo' },
      ]},
      { id: 'baseForm', label: 'Hình thái khởi đầu', type: 'textarea', full: true, placeholder: 'Mô tả cơ thể, giác quan, cách sinh tồn ban đầu...' },
      { id: 'stats', label: 'Chỉ số bẩm sinh', type: 'stats', stats: [
        { key: 'intellect', label: 'Trí Tuệ', min: 0, max: 100, def: 20 },
        { key: 'strength', label: 'Sức Mạnh', min: 0, max: 100, def: 30 },
        { key: 'speed', label: 'Tốc Độ', min: 0, max: 100, def: 30 },
        { key: 'adapt', label: 'Thích Nghi', min: 0, max: 100, def: 40 },
        { key: 'fertility', label: 'Sinh Sản', min: 0, max: 100, def: 50 },
        { key: 'lifespan', label: 'Tuổi Thọ', min: 0, max: 100, def: 30 },
      ]},
      { id: 'traits', label: 'Đặc điểm sinh học', type: 'tags', suggestions: [
        'Quang hợp', 'Hô hấp bằng mang', 'Cánh bay', 'Tái sinh chi', 'Ngụy trang',
        'Nọc độc', 'Giáp cứng', 'Cảm ứng linh khí', 'Bầy đàn', 'Lưỡng cư', 'Tâm linh giao cảm',
      ]},
      { id: 'evolution', label: 'Cây tiến hóa', type: 'graph', full: true, graph: {
        mode: 'tree', titleLabel: 'Hướng tiến hóa', metaLabel: 'Điều kiện kích hoạt',
        detailLabel: 'Kết quả & năng lực mới', addLabel: 'Thêm nhánh tiến hóa',
        rootHint: 'Bản thể khởi đầu — mọi nhánh tiến hóa mọc ra từ đây',
      }},
      { id: 'affinity', label: 'Thân với hệ sức mạnh', type: 'relations', relationTo: 'power' },
      { id: 'habitat', label: 'Môi trường sống', type: 'relations', relationTo: 'world' },
    ],
    presets: [
      { name: 'Nguyên Bào Thủy Tổ', values: {
        tagline: 'Đơn bào đầu tiên trong biển nguyên thủy — khởi đầu của muôn loài.',
        basis: 'Tế Bào (Carbon)', kingdom: 'Vi Sinh Vật',
        baseForm: 'Một túi màng đơn giản, hấp thu khoáng chất, phân đôi để sinh sản.',
        stats: { intellect: 2, strength: 3, speed: 10, adapt: 70, fertility: 95, lifespan: 5 },
        traits: ['Bầy đàn', 'Thích nghi'],
        evolution: [
          { title: 'Đa Bào Hóa', meta: 'Sống bầy đủ lâu, đủ dưỡng chất', detail: 'Các tế bào kết thành cơ thể lớn, phân hóa chức năng' },
          { title: 'Quang Hợp', meta: 'Trôi dạt gần mặt nước, nhiều ánh sáng', detail: 'Tự tổng hợp năng lượng từ ánh sáng, bùng nổ số lượng' },
          { title: 'Thực Bào Săn Mồi', meta: 'Khan hiếm dưỡng chất', detail: 'Nuốt tế bào khác, khởi đầu chuỗi thức ăn & vận động' },
        ],
      }},
      { name: 'Yêu Lang Tộc', values: {
        tagline: 'Sói khai trí, nuốt linh khí trăng mà hóa yêu, đi bằng hai chân.',
        basis: 'Tế Bào (Carbon)', kingdom: 'Linh Thú / Yêu Thú',
        baseForm: 'Thân sói lực lưỡng, khai mở linh trí, có thể hóa nhân hình dưới trăng tròn.',
        stats: { intellect: 55, strength: 75, speed: 80, adapt: 50, fertility: 40, lifespan: 55 },
        traits: ['Cảm ứng linh khí', 'Bầy đàn', 'Tái sinh chi'],
        evolution: [
          { title: 'Nguyệt Ảnh Lang', meta: 'Hấp thu nguyệt hoa trăm năm', detail: 'Ẩn hiện trong ánh trăng, tốc độ & ám sát tăng vọt' },
          { title: 'Cổ Chiến Lang Vương', meta: 'Dẫn dắt bầy, ăn tim cường địch', detail: 'Thân hình khổng lồ, uy áp khiến thú khác quy phục' },
        ],
        affinity: [],
      }},
      { name: 'Tinh Linh Nguyên Tố', values: {
        tagline: 'Ý thức thuần khiết ngưng từ nguyên tố, không cần thể xác vật chất.',
        basis: 'Nguyên Tố', kingdom: 'Thần Tộc',
        baseForm: 'Vầng sáng nguyên tố có tri giác, hình dạng thay đổi theo cảm xúc.',
        stats: { intellect: 70, strength: 40, speed: 60, adapt: 45, fertility: 10, lifespan: 90 },
        traits: ['Cảm ứng linh khí', 'Tâm linh giao cảm', 'Tái sinh chi'],
        evolution: [
          { title: 'Nguyên Tố Chi Chủ', meta: 'Dung hợp một nguyên tố tinh thuần cực lớn', detail: 'Chi phối cả một vùng nguyên tố, hóa bán thần' },
        ],
      }},
    ],
  },

  /* ───────────── 6. TẠO VẬT & TRANG BỊ ───────────── */
  {
    id: 'artifact',
    name: 'Tạo Vật',
    plural: 'Tạo Vật & Trang Bị',
    glyph: 'artifact',
    accent: '#c9a84c',
    tagline: 'Rèn thần binh, pháp bảo, thánh khí — từ vật liệu tới phụ phép tinh vi.',
    nameLabel: 'Tên tạo vật',
    namePlaceholder: 'vd: Hỗn Độn Chung, Thí Thần Kiếm, Bất Tử Giáp...',
    decreeNoun: 'một TẠO VẬT / THẦN KHÍ',
    fields: [
      { id: 'tagline', label: 'Bản chất', type: 'text', full: true },
      { id: 'type', label: 'Loại trang bị', type: 'select', options: [
        { value: 'Vũ Khí' }, { value: 'Giáp Trụ' }, { value: 'Trang Sức / Phù' },
        { value: 'Pháp Bảo' }, { value: 'Thần Khí' }, { value: 'Đan Dược' },
        { value: 'Trận Pháp' }, { value: 'Công Cụ' },
      ]},
      { id: 'rarity', label: 'Phẩm cấp', type: 'select', options: RARITY },
      { id: 'materials', label: 'Vật liệu cấu thành', type: 'relations', relationTo: 'material', hint: 'Chọn từ kho Nguyên Tố & Vật Liệu' },
      { id: 'recipe', label: 'Công thức rèn đúc', type: 'sublist', cols: {
        title: 'Thành phần', meta: 'Tỉ lệ / Lượng', detail: 'Vai trò trong tạo vật', addLabel: 'Thêm thành phần',
      }},
      { id: 'stats', label: 'Chỉ số trang bị', type: 'stats', stats: [
        { key: 'attack', label: 'Sát Thương', min: 0, max: 100, def: 30 },
        { key: 'defense', label: 'Phòng Ngự', min: 0, max: 100, def: 20 },
        { key: 'durability', label: 'Độ Bền', min: 0, max: 100, def: 60 },
        { key: 'spirit', label: 'Linh Lực', min: 0, max: 100, def: 40 },
      ]},
      { id: 'enchant', label: 'Phụ phép / Thần thông', type: 'tags', suggestions: [
        'Thiêu đốt', 'Băng phong', 'Hút linh hồn', 'Tự tu phục', 'Nhận chủ',
        'Vô hình', 'Xuyên giáp', 'Hồi sinh', 'Phong ấn', 'Không gian chứa đồ', 'Tăng tu vi',
      ]},
      { id: 'awaken', label: 'Chuỗi thăng cấp / thức tỉnh', type: 'graph', full: true, graph: {
        mode: 'chain', titleLabel: 'Hình thái', metaLabel: 'Điều kiện thăng cấp',
        detailLabel: 'Uy năng mới mở khóa', numeric: 'Cấp', addLabel: 'Thêm hình thái', rootHint: 'Sơ khởi',
      }},
      { id: 'powerSource', label: 'Vận hành bằng hệ sức mạnh', type: 'relations', relationTo: 'power' },
      { id: 'requirement', label: 'Điều kiện sử dụng', type: 'text', full: true, placeholder: 'Cảnh giới, huyết mạch, khế ước...' },
      { id: 'lore', label: 'Lai lịch & Truyền thuyết', type: 'textarea', full: true },
    ],
    presets: [
      { name: 'Hỗn Độn Chung', values: {
        tagline: 'Chuông cổ vang một tiếng, vạn pháp câm lặng, thời gian ngưng đọng.',
        type: 'Thần Khí', rarity: 'Hỗn Độn Phẩm',
        recipe: [
          { title: 'Tinh Thể Hỗn Độn', meta: 'Lõi chính', detail: 'Nguồn năng lượng và bản thể của chuông' },
          { title: 'Long Cốt', meta: 'Khung chuông', detail: 'Chịu đựng long uy, khắc trận văn' },
        ],
        stats: { attack: 70, defense: 90, durability: 100, spirit: 100 },
        enchant: ['Phong ấn', 'Tự tu phục', 'Nhận chủ'],
        requirement: 'Chỉ bậc Hóa Thần trở lên mới rung nổi một tiếng.',
      }},
      { name: 'Thí Thần Kiếm', values: {
        tagline: 'Kiếm sinh ra để chém thần; càng chém cường địch càng sắc.',
        type: 'Vũ Khí', rarity: 'Thần Phẩm',
        recipe: [
          { title: 'Huyền Thiết', meta: '70%', detail: 'Thân kiếm, nặng và sắc' },
          { title: 'Long Cốt', meta: '30%', detail: 'Sống kiếm, dẫn linh và tăng uy' },
        ],
        stats: { attack: 98, defense: 20, durability: 85, spirit: 80 },
        enchant: ['Xuyên giáp', 'Hút linh hồn', 'Nhận chủ'],
        requirement: 'Người cầm phải có đạo tâm kiên định, nếu không sẽ bị kiếm ý phản phệ.',
        awaken: [
          { title: 'Phàm Kiếm', meta: 'Vừa rèn xong', detail: 'Sắc bén hơn thường, chưa có kiếm linh', num: 1 },
          { title: 'Linh Kiếm', meta: 'Uống máu trăm trận', detail: 'Kiếm linh thức tỉnh, tự tìm yếu điểm địch', num: 3 },
          { title: 'Thí Thần', meta: 'Chém đứt thần cách một vị thần', detail: 'Cắt đứt cả quy luật & thần tính, vô vật bất phá', num: 5 },
        ],
      }},
    ],
  },

  /* ───────────── 7. TÍN NGƯỠNG ───────────── */
  {
    id: 'faith',
    name: 'Tín Ngưỡng',
    plural: 'Tín Ngưỡng & Tôn Giáo',
    glyph: 'faith',
    accent: '#d47a3a',
    tagline: 'Đức tin của chúng sinh — nguồn thần lực, giáo lý, và trật tự tinh thần.',
    nameLabel: 'Tên tín ngưỡng',
    namePlaceholder: 'vd: Quang Minh Thánh Giáo, Đạo Vô Vi...',
    decreeNoun: 'một HỆ TÍN NGƯỠNG',
    fields: [
      { id: 'tagline', label: 'Giáo nghĩa cốt lõi', type: 'text', full: true },
      { id: 'type', label: 'Loại hình', type: 'select', options: [
        { value: 'Đa Thần Giáo' }, { value: 'Nhất Thần Giáo' }, { value: 'Thờ Tổ Tiên' },
        { value: 'Sùng Bái Tự Nhiên' }, { value: 'Triết Học / Đạo' }, { value: 'Tà Giáo / Dị Đoan' }, { value: 'Vô Thần' },
      ]},
      { id: 'deity', label: 'Đối tượng thờ phụng', type: 'text', full: true, placeholder: 'Vị thần, tổ tiên, khái niệm được tôn thờ...' },
      { id: 'creed', label: 'Giáo lý & Vũ trụ quan', type: 'textarea', full: true },
      { id: 'practices', label: 'Nghi thức & Thực hành', type: 'tags', suggestions: [
        'Cầu nguyện', 'Hiến tế', 'Thiền định', 'Hành hương', 'Tụng kinh',
        'Rửa tội', 'Chay tịnh', 'Lễ hội mùa', 'Xây đền', 'Truyền giáo',
      ]},
      { id: 'faithPower', label: 'Đức tin sinh sức mạnh thế nào', type: 'textarea', full: true, placeholder: 'Niềm tin chuyển hóa thành thần lực, phép màu, phúc lành ra sao?' },
      { id: 'sects', label: 'Cây giáo phái', type: 'graph', full: true, graph: {
        mode: 'tree', titleLabel: 'Giáo phái / Nhánh', metaLabel: 'Ly khai vì',
        detailLabel: 'Khác biệt giáo lý & thực hành', addLabel: 'Thêm giáo phái', rootHint: 'Chính thống',
      }},
      { id: 'morality', label: 'Khuynh hướng đạo đức', type: 'select', options: [
        { value: 'Thuần Thiện / Trật Tự' }, { value: 'Trung Dung' }, { value: 'Thực Dụng' },
        { value: 'Cực Đoan' }, { value: 'Hắc Ám / Hỗn Loạn' },
      ]},
      { id: 'scale', label: 'Quy mô ảnh hưởng', type: 'select', options: SCALE },
      { id: 'taboos', label: 'Cấm kỵ & Dị giáo', type: 'textarea', full: true },
      { id: 'patronPower', label: 'Gắn với hệ sức mạnh', type: 'relations', relationTo: 'power' },
    ],
    presets: [
      { name: 'Quang Minh Thánh Giáo', values: {
        tagline: 'Ánh sáng xua tan bóng tối; cứu rỗi qua lòng thành và hy sinh.',
        type: 'Nhất Thần Giáo', deity: 'Quang Minh Thần — đấng sáng tạo mặt trời',
        creed: 'Vũ trụ là cuộc chiến vĩnh cửu giữa Sáng và Tối. Linh hồn thuần khiết sẽ về Thánh Quốc.',
        practices: ['Cầu nguyện', 'Rửa tội', 'Hành hương', 'Truyền giáo'],
        faithPower: 'Lòng thành tụ thành Thánh Lực, cho phép giáo sĩ trị thương, trừ tà, ban phúc lành.',
        morality: 'Thuần Thiện / Trật Tự', scale: 'Đại Lục',
        taboos: 'Cấm giao thiệp với ma tộc; kẻ bội giáo bị coi là Kẻ Sa Ngã.',
        sects: [
          { title: 'Chính Thống Giáo Hội', meta: 'Dòng chính', detail: 'Giáo lý nguyên bản, quyền lực tập trung ở Giáo Hoàng' },
          { title: 'Phái Khổ Tu', meta: 'Chê giáo hội xa hoa', detail: 'Sống khắc khổ, tự hành xác để thanh tẩy linh hồn' },
          { title: 'Dị Đoan Hoàng Hôn', meta: 'Lén thờ cả Bóng Tối', detail: 'Bị coi là tà giáo, hành lễ trong bí mật' },
        ],
      }},
      { name: 'Đạo Vô Vi', values: {
        tagline: 'Thuận theo tự nhiên, vô vi nhi trị, hòa mình vào Đại Đạo.',
        type: 'Triết Học / Đạo', deity: 'Đại Đạo — quy luật vô hình của vũ trụ',
        creed: 'Không cưỡng cầu, không chấp niệm; vạn vật tự có tiết điệu, thuận theo là đắc đạo.',
        practices: ['Thiền định', 'Chay tịnh', 'Tụng kinh'],
        faithPower: 'Đạo tâm thanh tịnh giúp cảm ngộ pháp tắc, tu vi tiến triển thuận theo thiên nhiên.',
        morality: 'Trung Dung', scale: 'Vùng',
      }},
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   Helpers
   ═══════════════════════════════════════════════════════ */

export function getCategory(id: CategoryId): CategoryDef {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[0];
}

/** Giá trị rỗng mặc định cho một field */
function blankValue(f: FieldDef): FieldValue {
  switch (f.type) {
    case 'tags':
    case 'relations':
      return [];
    case 'stats': {
      const o: Record<string, number> = {};
      (f.stats ?? []).forEach(s => { o[s.key] = s.def; });
      return o;
    }
    case 'sublist':
      return [] as SubItem[];
    case 'graph':
      return [] as GraphNode[];
    default:
      return '';
  }
}

/** Chuẩn hóa giá trị preset thành FieldValue đầy đủ */
function normalizeValue(f: FieldDef, raw: FieldValueInit | undefined): FieldValue {
  if (raw == null) return blankValue(f);
  if (f.type === 'sublist' && Array.isArray(raw)) {
    return (raw as Partial<SubItem>[]).map(r => ({
      title: r.title ?? '', meta: r.meta ?? '', detail: r.detail ?? '',
      ...(r.num != null ? { num: r.num } : {}),
    }));
  }
  if (f.type === 'graph' && Array.isArray(raw)) {
    const items = raw as Partial<SubItem>[];
    const nodes: GraphNode[] = items.map(r => ({
      id: crypto.randomUUID(), parent: null,
      title: r.title ?? '', meta: r.meta ?? '', detail: r.detail ?? '',
      ...(r.num != null ? { num: r.num } : {}),
    }));
    if ((f.graph?.mode ?? 'tree') === 'chain') {
      for (let i = 1; i < nodes.length; i++) nodes[i].parent = nodes[i - 1].id;
    }
    return nodes;
  }
  return raw as FieldValue;
}

/** Tạo entity mới rỗng cho một category */
export function blankEntity(cat: CategoryDef): StudioEntity {
  const values: Record<string, FieldValue> = {};
  cat.fields.forEach(f => { values[f.id] = blankValue(f); });
  return {
    id: crypto.randomUUID(),
    category: cat.id,
    name: '',
    values,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/** Tạo entity từ preset */
export function entityFromPreset(cat: CategoryDef, preset: PresetDef): StudioEntity {
  const base = blankEntity(cat);
  base.name = preset.name;
  cat.fields.forEach(f => {
    if (f.id in preset.values) {
      base.values[f.id] = normalizeValue(f, preset.values[f.id]);
    }
  });
  return base;
}

/** Dòng phụ đề hiển thị trên thẻ */
export function entitySummary(e: StudioEntity): string {
  const t = e.values.tagline;
  if (typeof t === 'string' && t.trim()) return t;
  const cat = getCategory(e.category);
  for (const f of cat.fields) {
    const v = e.values[f.id];
    if (typeof v === 'string' && v.trim()) return v;
  }
  return cat.tagline;
}

/* ── Đọc giá trị an toàn ── */
export const asStr = (v: FieldValue | undefined): string => (typeof v === 'string' ? v : '');
export const asArr = (v: FieldValue | undefined): string[] => (Array.isArray(v) && (v.length === 0 || typeof v[0] === 'string') ? (v as string[]) : []);
export const asStats = (v: FieldValue | undefined): Record<string, number> =>
  (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, number>) : {});
export const asSub = (v: FieldValue | undefined): SubItem[] =>
  (Array.isArray(v) && (v.length === 0 || (typeof v[0] === 'object' && !('parent' in (v[0] as object)))) ? (v as SubItem[]) : []);
export const asGraph = (v: FieldValue | undefined): GraphNode[] =>
  (Array.isArray(v) && (v.length === 0 || (typeof v[0] === 'object' && 'parent' in (v[0] as object))) ? (v as GraphNode[]) : []);

/** Nhãn hiển thị của một tag chip / relation */
export function resolveNames(ids: string[], all: StudioEntity[]): string[] {
  return ids.map(id => all.find(e => e.id === id)?.name || '').filter(Boolean);
}

/* ═══════════════════════════════════════════════════════
   LỜI TUYÊN SÁNG THẾ — dựng prompt gửi AI
   ═══════════════════════════════════════════════════════ */

export function buildDecree(e: StudioEntity, all: StudioEntity[]): string {
  const cat = getCategory(e.category);
  const lines: string[] = [];
  lines.push(`⟨SÁNG THẾ⟩ Ta vận dụng quyền năng, khai sinh ${cat.decreeNoun} vào cõi tồn tại:`);
  lines.push('');
  const head = e.name || `(${cat.name} chưa đặt tên)`;
  const tagline = asStr(e.values.tagline);
  lines.push(`**${head}**${tagline ? ` — ${tagline}` : ''}`);

  for (const f of cat.fields) {
    if (f.id === 'tagline') continue;
    const v = e.values[f.id];
    let rendered = '';
    switch (f.type) {
      case 'text':
      case 'textarea':
      case 'select':
        rendered = asStr(v).trim();
        break;
      case 'tags':
        rendered = asArr(v).join(', ');
        break;
      case 'relations':
        rendered = resolveNames(asArr(v), all).join(', ');
        break;
      case 'stats': {
        const s = asStats(v);
        const parts = (f.stats ?? [])
          .map(sd => `${sd.label} ${s[sd.key] ?? sd.def}`)
          .filter(Boolean);
        rendered = parts.join(' · ');
        break;
      }
      case 'sublist': {
        const rows = asSub(v).filter(r => r.title.trim());
        if (rows.length) {
          lines.push(`• ${f.label}:`);
          rows.forEach(r => {
            const bits = [r.title];
            if (r.num != null) bits.push(`[${r.num}]`);
            if (r.meta) bits.push(`(${r.meta})`);
            if (r.detail) bits.push(`— ${r.detail}`);
            lines.push(`   › ${bits.join(' ')}`);
          });
        }
        continue;
      }
      case 'graph': {
        const nodes = asGraph(v);
        if (nodes.some(n => n.title.trim())) {
          lines.push(`• ${f.label}:`);
          const walk = (parent: string | null, depth: number) => {
            nodes.filter(n => n.parent === parent && n.title.trim()).forEach(n => {
              const bits = [n.title];
              if (n.num != null) bits.push(`[${n.num}]`);
              if (n.meta) bits.push(`(${n.meta})`);
              if (n.detail) bits.push(`— ${n.detail}`);
              lines.push(`   ${'  '.repeat(depth)}› ${bits.join(' ')}`);
              walk(n.id, depth + 1);
            });
          };
          walk(null, 0);
        }
        continue;
      }
    }
    if (rendered) lines.push(`• ${f.label}: ${rendered}`);
  }

  lines.push('');
  lines.push(`Hãy tường thuật theo văn phong sử thi khoảnh khắc ${cat.name.toLowerCase()} này thành hình trong thế giới của ta, và những hệ quả đầu tiên nó mang lại.`);
  return lines.join('\n');
}
