/* ═══════════════════════════════════════════════════════
   CHARACTER CREATION WIZARD — Shared types & data
   ═══════════════════════════════════════════════════════ */

export type GamePath = 'creator' | 'mortal' | 'god';

export interface AttributeDef {
  key: string;
  name: string;
  description: string;
  min: number;
  max: number;
  default: number;
}

export interface TraitDef {
  id: string;
  name: string;
  description: string;
  effects: string;
}

export interface CharacterData {
  path: GamePath;
  name: string;
  title: string;           // biểu tự / danh xưng
  age: number | null;
  // Path-specific
  cosmicDomain: string;    // Creator: miền sáng tạo
  divineRealm: string;     // God: miền quyền năng
  mortalOrigin: string;    // Mortal: xuất thân
  mortalClass: string;     // Mortal: giai cấp
  region: string;          // khu vực khởi đầu
  era: string;             // kỷ nguyên / thời đại
  eraDescription: string;
  faction: string;         // phe phái
  attributes: Record<string, number>;
  traits: string[];        // bẩm phú đặc biệt
  customTraits: string;
  reputation: string;      // danh tiếng
  crisis: string;          // khủng hoảng ban đầu
  followerName: string;    // thuộc hạ / thiên sứ
  followerDesc: string;
  followerAttributes: Record<string, number>;
  backstory: string;       // bối cảnh tùy chỉnh
  cosmicRules: string;     // Creator: quy luật vũ trụ
  pantheonName: string;    // Creator: tên thần hệ
  appearance: string;      // ngoại hình
}

export const defaultCharacter: CharacterData = {
  path: 'creator',
  name: '',
  title: '',
  age: null,
  cosmicDomain: '',
  divineRealm: '',
  mortalOrigin: '',
  mortalClass: '',
  region: '',
  era: '',
  eraDescription: '',
  faction: '',
  attributes: {},
  traits: [],
  customTraits: '',
  reputation: '',
  crisis: '',
  followerName: '',
  followerDesc: '',
  followerAttributes: {},
  backstory: '',
  cosmicRules: '',
  pantheonName: '',
  appearance: '',
};

/* ── Attributes per path ── */

export const CREATOR_ATTRIBUTES: AttributeDef[] = [
  { key: 'creation', name: 'Sáng Tạo', description: 'Khả năng tạo ra vạn vật, sinh mệnh, và quy luật', min: -100, max: 100, default: 80 },
  { key: 'destruction', name: 'Huỷ Diệt', description: 'Quyền năng phá hủy, xóa bỏ, và tái cấu trúc', min: -100, max: 100, default: 0 },
  { key: 'wisdom', name: 'Toàn Tri', description: 'Khả năng nhìn thấu vạn vật, quá khứ và tương lai', min: -100, max: 100, default: 60 },
  { key: 'empathy', name: 'Từ Bi', description: 'Lòng thương xót và sự gắn kết với tạo vật', min: -100, max: 100, default: 30 },
  { key: 'chaos', name: 'Hỗn Mang', description: 'Sự ngẫu nhiên, bất ổn, và tiềm năng vô hạn', min: -100, max: 100, default: 20 },
  { key: 'order', name: 'Trật Tự', description: 'Sự ổn định, quy luật, và cấu trúc vũ trụ', min: -100, max: 100, default: 40 },
];

export const GOD_ATTRIBUTES: AttributeDef[] = [
  { key: 'divineForce', name: 'Thần Lực', description: 'Sức mạnh thần thánh tổng thể', min: -100, max: 100, default: 50 },
  { key: 'charisma', name: 'Uy Nghiêm', description: 'Khả năng thu phục tín đồ và uy hiếp kẻ thù', min: -100, max: 100, default: 40 },
  { key: 'intellect', name: 'Trí Tuệ', description: 'Mưu lược, kiến thức, và tầm nhìn chiến lược', min: -100, max: 100, default: 30 },
  { key: 'warfare', name: 'Chiến Tranh', description: 'Khả năng chiến đấu và dẫn dắt đạo quân thần thánh', min: -100, max: 100, default: 20 },
  { key: 'mysticism', name: 'Huyền Thuật', description: 'Phép thuật, lời nguyền, phúc lành', min: -100, max: 100, default: 35 },
  { key: 'diplomacy', name: 'Ngoại Giao', description: 'Quan hệ với thần linh khác, liên minh, đàm phán', min: -100, max: 100, default: 25 },
];

export const MORTAL_ATTRIBUTES: AttributeDef[] = [
  { key: 'strength', name: 'Võ Lực', description: 'Sức mạnh thể chất và kỹ năng chiến đấu', min: -100, max: 100, default: 20 },
  { key: 'intelligence', name: 'Trí Tuệ', description: 'Khả năng suy luận, mưu lược, học hỏi', min: -100, max: 100, default: 30 },
  { key: 'charm', name: 'Khí Chất', description: 'Sức hấp dẫn, khả năng lãnh đạo và thuyết phục', min: -100, max: 100, default: 15 },
  { key: 'luck', name: 'Vận May', description: 'Vận mệnh, cơ duyên, và sự may mắn', min: -100, max: 100, default: 0 },
  { key: 'cultivation', name: 'Linh Căn', description: 'Tiềm năng tu luyện và tiếp nhận sức mạnh siêu nhiên', min: -100, max: 100, default: 10 },
  { key: 'constitution', name: 'Thể Chất', description: 'Sức khoẻ, sức bền, khả năng chịu đựng', min: -100, max: 100, default: 25 },
];

/* ── Traits per path ── */

export const CREATOR_TRAITS: TraitDef[] = [
  { id: 'omnipresent', name: 'Vô Sở Bất Tại', description: 'Hiện diện khắp mọi nơi cùng lúc', effects: 'Toàn Tri +30' },
  { id: 'infinite_patience', name: 'Nhẫn Nại Vô Biên', description: 'Thời gian chỉ là khái niệm do ngươi tạo ra', effects: 'Trật Tự +20, Hỗn Mang -10' },
  { id: 'whimsical', name: 'Biến Hóa Khôn Lường', description: 'Tạo vật phản ánh tâm trạng thất thường của ngươi', effects: 'Hỗn Mang +30, Trật Tự -15' },
  { id: 'benevolent', name: 'Từ Phụ Vạn Loài', description: 'Mọi tạo vật đều là con cái ngươi yêu thương', effects: 'Từ Bi +40' },
  { id: 'detached', name: 'Siêu Nhiên Thoát Tục', description: 'Đứng ngoài mọi sáng tạo, quan sát không can thiệp', effects: 'Toàn Tri +25, Từ Bi -20' },
  { id: 'perfectionist', name: 'Hoàn Mỹ Chủ Nghĩa', description: 'Mỗi tạo vật phải là tuyệt tác', effects: 'Sáng Tạo +20, Trật Tự +15' },
  { id: 'experimentalist', name: 'Thí Nghiệm Gia', description: 'Tạo ra để xem chuyện gì xảy ra', effects: 'Hỗn Mang +20, Sáng Tạo +15' },
  { id: 'dual_nature', name: 'Nhị Nguyên Thể', description: 'Vừa sáng tạo vừa huỷ diệt, hai mặt song hành', effects: 'Sáng Tạo +15, Huỷ Diệt +15' },
];

export const GOD_TRAITS: TraitDef[] = [
  { id: 'ancient_pact', name: 'Cổ Ước Thần Thánh', description: 'Một giao ước cổ xưa ràng buộc quyền năng ngươi', effects: 'Thần Lực +20, Huyền Thuật +15' },
  { id: 'wrath', name: 'Thần Nộ', description: 'Cơn giận của ngươi khiến trời đất chấn động', effects: 'Chiến Tranh +30, Ngoại Giao -15' },
  { id: 'shapeshifter', name: 'Thiên Biến Vạn Hoá', description: 'Có thể biến thành bất cứ hình dạng nào', effects: 'Huyền Thuật +25, Uy Nghiêm +10' },
  { id: 'prophet', name: 'Tiên Tri', description: 'Nhìn thấy tương lai qua những giấc mơ thần bí', effects: 'Trí Tuệ +30' },
  { id: 'oathkeeper', name: 'Thệ Ngôn Bất Di', description: 'Lời hứa của ngươi là quy luật bất biến', effects: 'Ngoại Giao +25, Uy Nghiêm +15' },
  { id: 'trickster', name: 'Quỷ Kế Đa Mưu', description: 'Lừa gạt, biến ảo, không ai đoán được ý ngươi', effects: 'Trí Tuệ +20, Ngoại Giao -10' },
  { id: 'elemental', name: 'Nguyên Tố Chi Thần', description: 'Gắn liền với một nguyên tố cơ bản', effects: 'Thần Lực +25, Huyền Thuật +10' },
  { id: 'forgotten', name: 'Thần Bị Lãng Quên', description: 'Từng hùng mạnh, nay bị tín đồ quên lãng', effects: 'Thần Lực -20, Trí Tuệ +25' },
];

export const MORTAL_TRAITS: TraitDef[] = [
  { id: 'prodigy', name: 'Thiên Tài Bẩm Sinh', description: 'Sinh ra với tài năng vượt trội phi thường', effects: 'Trí Tuệ +30, Linh Căn +15' },
  { id: 'destined', name: 'Mệnh Định Phong Thần', description: 'Vận mệnh đã định sẵn con đường thăng thiên', effects: 'Vận May +30, Linh Căn +20' },
  { id: 'cursed', name: 'Nguyền Rủa Huyết Thống', description: 'Dòng máu mang lời nguyền từ đời tổ tiên', effects: 'Vận May -20, Linh Căn +25' },
  { id: 'ironwill', name: 'Ý Chí Sắt Đá', description: 'Không gì có thể bẻ gãy tinh thần ngươi', effects: 'Thể Chất +20, Khí Chất +15' },
  { id: 'streetwise', name: 'Giang Hồ Từng Trải', description: 'Lớn lên trong gian khổ, thông thạo nhân tình thế thái', effects: 'Khí Chất +20, Trí Tuệ +10' },
  { id: 'sickly', name: 'Thể Nhược Đa Bệnh', description: 'Cơ thể yếu ớt nhưng tâm trí mẫn tiệp', effects: 'Thể Chất -30, Trí Tuệ +20' },
  { id: 'warrior_blood', name: 'Dòng Máu Chiến Binh', description: 'Tổ tiên là dòng dõi chiến binh lừng danh', effects: 'Võ Lực +30, Thể Chất +10' },
  { id: 'spirit_touched', name: 'Được Thần Linh Chạm', description: 'Từng gặp thần linh khi còn nhỏ, để lại dấu ấn', effects: 'Linh Căn +35, Vận May +10' },
];

/* ── Reputations ── */

export const CREATOR_REPUTATIONS = [
  { id: 'unknown', name: 'Vô Danh', description: 'Vừa mới thức tỉnh, chưa ai biết đến sự tồn tại của ngươi' },
  { id: 'whispered', name: 'Thì Thầm Trong Hư Vô', description: 'Có gì đó đang khuấy động, nhưng chưa ai hiểu' },
  { id: 'feared', name: 'Khiến Hư Vô Run Sợ', description: 'Sự tồn tại của ngươi khiến chính hư vô cũng phải chấn động' },
];

export const GOD_REPUTATIONS = [
  { id: 'forgotten', name: 'Thần Bị Lãng Quên', description: 'Từng có tín đồ, nay chẳng ai còn nhớ tên' },
  { id: 'local', name: 'Thần Địa Phương', description: 'Được một vùng nhỏ tôn thờ, chưa ai biết ở nơi xa' },
  { id: 'regional', name: 'Danh Vọng Một Phương', description: 'Tín đồ khắp một vùng, các thần khác biết tiếng' },
  { id: 'renowned', name: 'Lừng Danh Thiên Giới', description: 'Mọi thần linh đều biết tên, phàm nhân kính sợ' },
  { id: 'cosmic', name: 'Vũ Trụ Kính Ngưỡng', description: 'Quyền năng khiến cả thần giới phải nể phục' },
  { id: 'infamous', name: 'Ác Thần Đáng Sợ', description: 'Tên ngươi là lời nguyền, ai nghe cũng run rẩy' },
];

export const MORTAL_REPUTATIONS = [
  { id: 'nobody', name: 'Vô Danh Tiểu Tốt', description: 'Chẳng ai biết ngươi là ai, chỉ là một phàm nhân tầm thường' },
  { id: 'local_known', name: 'Hương Thôn Truyền Tụng', description: 'Dân làng biết tên, có chút tiếng tăm nhỏ' },
  { id: 'regional_fame', name: 'Châu Quận Trì Danh', description: 'Danh vọng một phương, quan viên biết mặt' },
  { id: 'legendary', name: 'Thiên Hạ Đệ Nhất', description: 'Tên tuổi vang khắp thiên hạ, ai ai cũng biết' },
  { id: 'feared', name: 'Vạn Phu Sở Chỉ', description: 'Bị ngàn người chỉ trích, danh tiếng xấu xa' },
  { id: 'mysterious', name: 'Bí Ẩn Mạc Trắc', description: 'Không ai biết rõ ngươi, nhưng đều cảm thấy bất an' },
];

/* ── Crises ── */

export const CREATOR_CRISES = [
  { id: 'void_hunger', name: 'Hư Vô Đói Khát', description: 'Hư vô nguyên thuỷ đang nuốt chửng mọi thứ ngươi tạo ra, ngươi phải tìm cách ổn định sáng tạo đầu tiên.' },
  { id: 'first_rebellion', name: 'Tạo Vật Nổi Loạn', description: 'Tạo vật đầu tiên của ngươi bắt đầu thách thức quyền năng sáng tạo, đòi tự do riêng.' },
  { id: 'cosmic_flaw', name: 'Lỗi Trong Quy Luật', description: 'Quy luật vũ trụ ngươi thiết lập có một lỗ hổng nghiêm trọng, đe dọa toàn bộ sáng tạo.' },
  { id: 'loneliness', name: 'Cô Đơn Vô Tận', description: 'Là đấng sáng tạo duy nhất, sự cô đơn vĩnh cửu bắt đầu ảnh hưởng đến tâm trí ngươi.' },
  { id: 'custom', name: 'Tự Định Nghĩa', description: 'Mô tả khủng hoảng theo ý ngươi...' },
];

export const GOD_CRISES = [
  { id: 'temple_destroyed', name: 'Đền Thờ Bị Phá Huỷ', description: 'Đền thờ lớn nhất bị kẻ thù tàn phá, tín đồ hoang mang dao động.' },
  { id: 'rival_god', name: 'Thần Thù Trỗi Dậy', description: 'Một vị thần đối thủ đang lôi kéo tín đồ của ngươi và thách thức quyền năng.' },
  { id: 'faith_crisis', name: 'Tín Ngưỡng Suy Thoái', description: 'Phàm nhân bắt đầu nghi ngờ sự tồn tại của thần linh, lòng sùng kính sụt giảm.' },
  { id: 'divine_curse', name: 'Lời Nguyền Thượng Cổ', description: 'Một lời nguyền cổ xưa đang dần phong ấn quyền năng của ngươi.' },
  { id: 'mortal_champion', name: 'Anh Hùng Diệt Thần', description: 'Một phàm nhân đặc biệt đang tập hợp lực lượng để lật đổ thần quyền.' },
  { id: 'custom', name: 'Tự Định Nghĩa', description: 'Mô tả khủng hoảng theo ý ngươi...' },
];

export const MORTAL_CRISES = [
  { id: 'war', name: 'Chiến Loạn Bùng Nổ', description: 'Chiến tranh tàn khốc, quê hương bị tàn phá, phải chạy nạn hoặc chiến đấu.' },
  { id: 'betrayal', name: 'Bị Phản Bội', description: 'Người thân cận nhất phản bội, mất hết tài sản và địa vị.' },
  { id: 'divine_mark', name: 'Bị Thần Linh Đánh Dấu', description: 'Một vị thần để mắt đến ngươi — may mắn hay tai họa, chưa ai biết.' },
  { id: 'plague', name: 'Đại Dịch Hoành Hành', description: 'Dịch bệnh quét sạch làng mạc, ngươi là một trong số ít người sống sót.' },
  { id: 'debt', name: 'Nợ Máu Chồng Chất', description: 'Gia tộc bị diệt, ngươi mang thù hận sâu nặng cần phải trả.' },
  { id: 'custom', name: 'Tự Định Nghĩa', description: 'Mô tả khủng hoảng theo ý ngươi...' },
];

/* ── Step definitions ── */

export interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
}

export const CREATOR_STEPS: WizardStep[] = [
  { id: 'identity', title: 'Danh Xưng Sáng Thế', subtitle: 'Đặt tên và mô tả bản chất thần thánh của ngươi' },
  { id: 'cosmic_domain', title: 'Miền Sáng Tạo', subtitle: 'Ngươi bắt đầu sáng tạo từ đâu?' },
  { id: 'attributes', title: 'Bản Chất & Thiên Phú', subtitle: 'Phác họa quyền năng sáng thế của ngươi' },
  { id: 'cosmos', title: 'Quy Luật Vũ Trụ', subtitle: 'Thiết lập luật lệ cho thế giới ngươi sáng tạo' },
  { id: 'crisis', title: 'Thử Thách Khởi Đầu', subtitle: 'Mọi sáng tạo đều đối mặt khủng hoảng đầu tiên' },
  { id: 'preview', title: 'Tổng Quan', subtitle: 'Xem lại trước khi bước vào hư vô' },
];

export const GOD_STEPS: WizardStep[] = [
  { id: 'identity', title: 'Danh Xưng Thần Thánh', subtitle: 'Đặt tên và miền quyền năng' },
  { id: 'era', title: 'Kỷ Nguyên & Thế Giới', subtitle: 'Ngươi tồn tại trong kỷ nguyên nào?' },
  { id: 'faction', title: 'Thần Hệ & Liên Minh', subtitle: 'Ngươi thuộc thần hệ nào, hay tự lập?' },
  { id: 'attributes', title: 'Quyền Năng & Thiên Phú', subtitle: 'Phác họa sức mạnh thần thánh' },
  { id: 'followers', title: 'Tín Đồ & Thiên Sứ', subtitle: 'Ai phục vụ ngươi trên trần gian?' },
  { id: 'reputation', title: 'Danh Tiếng Thần Giới', subtitle: 'Thiên hạ biết gì về ngươi?' },
  { id: 'crisis', title: 'Khủng Hoảng Hiện Tại', subtitle: 'Thách thức nào đang đe dọa ngươi?' },
  { id: 'preview', title: 'Tổng Quan', subtitle: 'Xem lại trước khi giáng lâm' },
];

export const MORTAL_STEPS: WizardStep[] = [
  { id: 'identity', title: 'Thân Phận & Tên Họ', subtitle: 'Ngươi là ai trong trần thế?' },
  { id: 'origin', title: 'Xuất Thân & Giai Cấp', subtitle: 'Dòng dõi và hoàn cảnh sinh ra' },
  { id: 'era', title: 'Thời Đại & Khu Vực', subtitle: 'Ngươi sống ở đâu, thời nào?' },
  { id: 'faction', title: 'Phe Phái Trực Thuộc', subtitle: 'Ngươi phục vụ ai, hay tự do?' },
  { id: 'attributes', title: 'Thuộc Tính & Bẩm Phú', subtitle: 'Tài kiêm văn võ, hay chỉ giỏi một bề?' },
  { id: 'reputation', title: 'Danh Tiếng', subtitle: 'Thiên hạ biết gì về ngươi?' },
  { id: 'crisis', title: 'Khủng Hoảng Hiện Tại', subtitle: 'Khốn cảnh nào đang đối mặt?' },
  { id: 'companion', title: 'Đồng Hành', subtitle: 'Ngươi có ai đi cùng không?' },
  { id: 'preview', title: 'Tổng Quan', subtitle: 'Xem lại trước khi bước vào loạn thế' },
];
