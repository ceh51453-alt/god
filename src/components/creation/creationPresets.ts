import { CharacterData } from './creationData';

export interface CharacterPreset {
  id: string;
  label: string;
  description: string;
  data: Partial<CharacterData>;
}

export const CREATOR_PRESETS: CharacterPreset[] = [
  {
    id: 'hon_nguyen',
    label: 'Hỗn Nguyên Đạo Tổ',
    description: 'Thực thể cổ đại, khai thiên lập địa từ hỗn mang',
    data: {
      name: 'Hỗn Nguyên Đạo Tổ',
      title: 'Đấng Khai Thiên',
      cosmicDomain: 'chaos',
      attributes: { creation: 90, destruction: 10, wisdom: 80, empathy: 20, chaos: 50, order: 50 },
      traits: ['omnipresent', 'detached'],
      reputation: 'feared',
      crisis: 'void_hunger',
      appearance: 'Ông lão tóc bạc râu dài, mặc đạo bào sao trời',
    }
  },
  {
    id: 'architect',
    label: 'Đấng Kiến Tạo Vĩ Đại',
    description: 'Thực thể thuần lý trí, thiết lập vũ trụ bằng những quy luật nghiêm ngặt',
    data: {
      name: 'Đấng Kiến Tạo',
      title: 'Kiến Trúc Sư Của Vạn Vật',
      cosmicDomain: 'word',
      attributes: { creation: 80, destruction: 0, wisdom: 90, empathy: 10, chaos: -50, order: 100 },
      traits: ['perfectionist', 'infinite_patience'],
      reputation: 'whispered',
      crisis: 'cosmic_flaw',
      appearance: 'Khối đa diện phát sáng với những con mắt toàn tri',
    }
  }
];

export const GOD_PRESETS: CharacterPreset[] = [
  {
    id: 'war_god',
    label: 'Chiến Thần Tàn Bạo',
    description: 'Thần linh sinh ra từ chiến tranh, cai quản chiến trường và cái chết',
    data: {
      name: 'Ares / Lữ Bố',
      title: 'Bá Chủ Chiến Trường',
      divineRealm: 'Chiến Tranh & Hủy Diệt',
      age: 5000,
      attributes: { divineForce: 90, charisma: 50, intellect: 20, warfare: 100, mysticism: 10, diplomacy: -20 },
      traits: ['wrath', 'ancient_pact'],
      reputation: 'infamous',
      crisis: 'mortal_champion',
      followerName: 'Đạo Quân Bất Tử',
      appearance: 'Nam thần thân hình cường tráng, khoác giáp cháy rực',
    }
  },
  {
    id: 'nature_goddess',
    label: 'Nữ Thần Sinh Mệnh',
    description: 'Bảo hộ sự sống, chữa lành tổn thương và mang lại mùa màng',
    data: {
      name: 'Mộc Tinh Linh Nữ Vương',
      title: 'Mẹ Của Sự Sống',
      divineRealm: 'Tự Nhiên & Sinh Mệnh',
      age: 10000,
      attributes: { divineForce: 60, charisma: 80, intellect: 60, warfare: -20, mysticism: 80, diplomacy: 90 },
      traits: ['elemental', 'prophet'],
      reputation: 'cosmic',
      crisis: 'faith_crisis',
      followerName: 'Giáo Đoàn Rừng Xanh',
      appearance: 'Nữ thần tóc xanh lá, dung mạo tuyệt mĩ, tỏa hương hoa',
    }
  }
];

export const MORTAL_PRESETS: CharacterPreset[] = [
  {
    id: 'swordsman',
    label: 'Thiên Tài Kiếm Khách',
    description: 'Thanh niên xuất thân bần hàn nhưng có ngộ tính kiếm đạo vô song',
    data: {
      name: 'Lâm Dật',
      title: 'Vô Ảnh Kiếm',
      mortalClass: 'peasant',
      age: 18,
      region: 'Thanh Vân Sơn',
      attributes: { strength: 60, intelligence: 50, charm: 40, luck: 20, cultivation: 90, constitution: 40 },
      traits: ['prodigy', 'ironwill'],
      reputation: 'local_known',
      crisis: 'betrayal',
      appearance: 'Mặc áo vải đơn sơ, lưng đeo kiếm gỗ, ánh mắt sắc như gươm',
    }
  },
  {
    id: 'fallen_noble',
    label: 'Tướng Quân Lưu Vong',
    description: 'Dòng dõi quan lớn bị vu oan giáng chức, nuôi chí báo thù',
    data: {
      name: 'Triệu Cảnh',
      title: 'Huyết Sói',
      mortalClass: 'noble',
      age: 24,
      region: 'Biên Ải Phương Bắc',
      attributes: { strength: 80, intelligence: 70, charm: 60, luck: -20, cultivation: 30, constitution: 80 },
      traits: ['warrior_blood', 'cursed'],
      reputation: 'feared',
      crisis: 'debt',
      followerName: 'Thiết Kỵ Vệ',
      appearance: 'Mặc áo giáp sứt mẻ, mang vết sẹo lớn trên mặt',
    }
  }
];
