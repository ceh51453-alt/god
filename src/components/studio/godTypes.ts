/* ═══════════════════════════════════════════════════════
   THẦN ĐIỆN — Schema-driven System for God Path
   ═══════════════════════════════════════════════════════ */

import type { FieldDef, PresetDef, FieldValue } from './studioTypes';

export type GodCategoryId =
  | 'follower'   // Tín Đồ
  | 'temple'     // Đền Thờ
  | 'miracle'    // Phép Màu
  | 'divine_artifact'; // Thần Khí

export interface GodCategoryDef {
  id: GodCategoryId;
  name: string;
  plural: string;
  glyph: string;
  accent: string;
  tagline: string;
  nameLabel: string;
  namePlaceholder: string;
  decreeNoun: string;
  fields: FieldDef[];
  presets: PresetDef[];
}

export interface GodEntity {
  id: string;
  category: GodCategoryId;
  name: string;
  values: Record<string, FieldValue>;
  createdAt: number;
  updatedAt: number;
}

export const GOD_CATEGORIES: GodCategoryDef[] = [
  {
    id: 'follower',
    name: 'Thuộc Hạ / Thế Lực',
    plural: 'Thuộc hạ & Thế lực',
    glyph: 'users',
    accent: '#d4874a',
    tagline: 'Những kẻ tôn thờ, phục vụ hoặc dâng hiến đức tin cho ngươi.',
    nameLabel: 'Tên Tổ Chức / Cá Nhân',
    namePlaceholder: 'vd: Quân đoàn Zerg, Giáo Hội Ánh Sáng, Tập đoàn AI, Thánh Nữ Elara...',
    decreeNoun: 'một THUỘC HẠ / THẾ LỰC',
    fields: [
      { id: 'tagline', label: 'Vai trò', type: 'text', full: true },
      { id: 'devotion', label: 'Mức độ trung thành', type: 'select', options: [
        { value: 'Bình Thường' }, { value: 'Tuyệt Đối' }, { value: 'Cuồng Tín' }, { value: 'Lập Trình Sẵn' }, { value: 'Có Lợi Ích' }
      ]},
      { id: 'scale', label: 'Quy mô', type: 'select', options: [
        { value: 'Cá Nhân' }, { value: 'Nhóm Nhỏ' }, { value: 'Tổ Chức' }, { value: 'Đại Trà' }, { value: 'Toàn Cầu' }
      ]},
      { id: 'effect', label: 'Lợi ích mang lại', type: 'textarea', full: true },
    ],
    presets: []
  },
  {
    id: 'temple',
    name: 'Cứ Điểm / Lãnh Địa',
    plural: 'Lãnh địa & Cơ sở',
    glyph: 'law', // TempleIcon can be mapped to law or artifact for now in UI
    accent: '#a8844a',
    tagline: 'Căn cứ, đền thờ, hoặc lõi mạng lưới thuộc quyền kiểm soát của ngươi.',
    nameLabel: 'Tên Cứ Điểm / Lãnh Địa',
    namePlaceholder: 'vd: Đại Thánh Đường, Căn cứ ngầm Area 51, Lõi mạng Skynet...',
    decreeNoun: 'một CỨ ĐIỂM / LÃNH ĐỊA',
    fields: [
      { id: 'tagline', label: 'Miêu tả', type: 'text', full: true },
      { id: 'location', label: 'Vị trí', type: 'text' },
      { id: 'status', label: 'Trạng thái', type: 'select', options: [
        { value: 'Đang Hoạt Động' }, { value: 'Đang Nâng Cấp' }, { value: 'Suy Yếu' }, { value: 'Hoang Phế' }
      ]},
      { id: 'effect', label: 'Sức ảnh hưởng', type: 'textarea', full: true },
    ],
    presets: []
  },
  {
    id: 'miracle',
    name: 'Quyền Năng / Tác Động',
    plural: 'Quyền năng & Tác động',
    glyph: 'power',
    accent: '#9b6bbf',
    tagline: 'Quyền năng hoặc sự can thiệp ngươi giáng xuống thế giới.',
    nameLabel: 'Tên Quyền Năng / Hành Động',
    namePlaceholder: 'vd: Mưa Cứu Hạn, Kích hoạt Hack vệ tinh, Bệnh Dịch Diệt Vong...',
    decreeNoun: 'một QUYỀN NĂNG / TÁC ĐỘNG',
    fields: [
      { id: 'tagline', label: 'Miêu tả', type: 'text', full: true },
      { id: 'type', label: 'Bản chất', type: 'select', options: [
        { value: 'Hỗ Trợ / Ban Phước' }, { value: 'Tấn Công / Giáng Họa' }, { value: 'Khám Phá / Khải Thị' }, { value: 'Biến Đổi / Can Thiệp' }
      ]},
      { id: 'cost', label: 'Tiêu hao năng lượng/hương hỏa', type: 'text' },
      { id: 'effect', label: 'Kết quả', type: 'textarea', full: true },
    ],
    presets: []
  },
  {
    id: 'divine_artifact',
    name: 'Di Sản / Tạo Tác',
    plural: 'Di sản & Tạo tác',
    glyph: 'artifact',
    accent: '#c9a84c',
    tagline: 'Vật phẩm mang quyền năng hoặc công nghệ lõi ban cho thế giới.',
    nameLabel: 'Tên Di Sản / Tạo Tác',
    namePlaceholder: 'vd: Chén Thánh, Gươm Ánh Sáng, Mã Nguồn Gốc...',
    decreeNoun: 'một DI SẢN / TẠO TÁC',
    fields: [
      { id: 'tagline', label: 'Miêu tả', type: 'text', full: true },
      { id: 'holder', label: 'Người nắm giữ', type: 'text' },
      { id: 'power', label: 'Quyền năng', type: 'textarea', full: true },
    ],
    presets: []
  }
];

export function getGodCategory(id: GodCategoryId): GodCategoryDef {
  return GOD_CATEGORIES.find(c => c.id === id) || GOD_CATEGORIES[0];
}

export function blankGodEntity(c: GodCategoryDef): GodEntity {
  return {
    id: crypto.randomUUID(),
    category: c.id,
    name: '',
    values: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function godEntitySummary(e: GodEntity): string {
  const t = e.values.tagline;
  if (t && typeof t === 'string') return t;
  return 'Thực thể thần thánh chưa rõ đặc tính.';
}
