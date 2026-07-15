/* ═══════════════════════════════════════════════════════
   ĐỘNG PHỦ — Schema-driven System for Mortal Path
   ═══════════════════════════════════════════════════════ */

import type { FieldDef, PresetDef, FieldValue } from './studioTypes';

export type MortalCategoryId =
  | 'realm'      // Cảnh Giới
  | 'technique'  // Công Pháp
  | 'artifact'   // Pháp Bảo
  | 'encounter'; // Kỳ Ngộ

export interface MortalCategoryDef {
  id: MortalCategoryId;
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

export interface MortalEntity {
  id: string;
  category: MortalCategoryId;
  name: string;
  values: Record<string, FieldValue>;
  createdAt: number;
  updatedAt: number;
}

export const MORTAL_CATEGORIES: MortalCategoryDef[] = [
  {
    id: 'realm',
    name: 'Trạng Thái / Cấp Bậc',
    plural: 'Trạng thái & Tiến trình',
    glyph: 'users',
    accent: '#4a8fa8',
    tagline: 'Ghi nhận quá trình thăng tiến, cấp bậc nghề nghiệp hoặc trạng thái của bản thân.',
    nameLabel: 'Tên Trạng thái / Cấp bậc',
    namePlaceholder: 'vd: Đặc vụ cấp S, Trúc Cơ Kỳ, Ma pháp sư bậc 3, Đột biến cấp 4...',
    decreeNoun: 'một TRẠNG THÁI / CẤP BẬC',
    fields: [
      { id: 'tagline', label: 'Mô tả', type: 'text', full: true },
      { id: 'level', label: 'Cấp độ / Giai đoạn', type: 'text' },
      { id: 'breakthrough', label: 'Điều kiện thăng tiến', type: 'textarea', full: true },
    ],
    presets: []
  },
  {
    id: 'technique',
    name: 'Kỹ Năng / Năng Lực',
    plural: 'Hệ thống Kỹ năng',
    glyph: 'law',
    accent: '#9b6bbf',
    tagline: 'Các kỹ năng, năng lực đặc biệt, phép thuật hoặc công nghệ đã làm chủ.',
    nameLabel: 'Tên Kỹ năng',
    namePlaceholder: 'vd: Hack não bộ, Hàng Long Thập Bát Chưởng, Điều khiển trọng lực...',
    decreeNoun: 'một KỸ NĂNG / NĂNG LỰC',
    fields: [
      { id: 'tagline', label: 'Tóm tắt / Khẩu quyết', type: 'text', full: true },
      { id: 'type', label: 'Loại hình', type: 'select', options: [
        { value: 'Thể Chất' }, { value: 'Tinh Thần' }, { value: 'Ma Thuật' }, { value: 'Công Nghệ' }, { value: 'Kỹ Năng Mềm' }, { value: 'Khác' }
      ]},
      { id: 'mastery', label: 'Mức độ thông thạo', type: 'select', options: [
        { value: 'Mới Học' }, { value: 'Thành Thạo' }, { value: 'Bậc Thầy' }, { value: 'Siêu Phàm' }, { value: 'Tuyệt Đỉnh' }
      ]},
      { id: 'effect', label: 'Hiệu quả thực tế', type: 'textarea', full: true },
    ],
    presets: []
  },
  {
    id: 'artifact',
    name: 'Vật Phẩm / Tài Sản',
    plural: 'Trang bị & Tài sản',
    glyph: 'artifact',
    accent: '#c9a84c',
    tagline: 'Trang bị, vũ khí, phương tiện, hoặc tài sản sở hữu.',
    nameLabel: 'Tên Vật Phẩm',
    namePlaceholder: 'vd: Súng Laser, Huyết Liên Đan, Xe Bọc Thép, Áo Choàng Tàng Hình...',
    decreeNoun: 'một VẬT PHẨM / TÀI SẢN',
    fields: [
      { id: 'tagline', label: 'Miêu tả', type: 'text', full: true },
      { id: 'type', label: 'Phân loại', type: 'select', options: [
        { value: 'Vũ Khí' }, { value: 'Công Cụ' }, { value: 'Phương Tiện' }, { value: 'Tài Nguyên' }, { value: 'Bảo Vật' }, { value: 'Khác' }
      ]},
      { id: 'rarity', label: 'Phẩm cấp', type: 'select', options: [
        { value: 'Thông Thường' }, { value: 'Hiếm Có' }, { value: 'Sử Thi' }, { value: 'Huyền Thoại' }, { value: 'Di Sản' }
      ]},
      { id: 'effect', label: 'Công dụng', type: 'textarea', full: true },
    ],
    presets: []
  },
  {
    id: 'encounter',
    name: 'Sự Kiện / Cột Mốc',
    plural: 'Cột mốc & Sự kiện',
    glyph: 'world',
    accent: '#a8844a',
    tagline: 'Những cột mốc quan trọng, biến cố, hoặc kỳ ngộ định mệnh.',
    nameLabel: 'Tên Sự Kiện / Cột Mốc',
    namePlaceholder: 'vd: Sống sót qua thảm họa, Khám phá Bí cảnh, Đạt giải Nobel, Ám sát hụt...',
    decreeNoun: 'một SỰ KIỆN',
    fields: [
      { id: 'tagline', label: 'Tóm tắt sự kiện', type: 'text', full: true },
      { id: 'outcome', label: 'Hậu quả / Lợi ích', type: 'textarea', full: true },
    ],
    presets: []
  }
];

export function getMortalCategory(id: MortalCategoryId): MortalCategoryDef {
  return MORTAL_CATEGORIES.find(c => c.id === id) || MORTAL_CATEGORIES[0];
}

export function blankMortalEntity(c: MortalCategoryDef): MortalEntity {
  return {
    id: crypto.randomUUID(),
    category: c.id,
    name: '',
    values: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function mortalEntitySummary(e: MortalEntity): string {
  const t = e.values.tagline;
  if (t && typeof t === 'string') return t;
  return 'Thực thể phàm nhân chưa rõ đặc tính.';
}
