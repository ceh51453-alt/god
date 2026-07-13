/* ═══════════════════════════════════════════════════════
   PANTHEON DATA — 5 Mythological Systems
   Sáng Thế Thần across cultures
   ═══════════════════════════════════════════════════════ */

export type PantheonId = 'olympus' | 'asgard' | 'thien_dinh' | 'svarga' | 'mictlan';

export interface DomainDef {
  id: string;
  name: string;
  nameVi: string;
  description: string;
  descriptionVi: string;
  bonuses: string;
  startingPower: number;
  icon: string; // key for SVG icon
}

export interface PantheonDef {
  id: PantheonId;
  name: string;
  nameVi: string;
  origin: string;
  originVi: string;
  description: string;
  descriptionVi: string;
  creatorGod: string;
  creatorGodVi: string;
  lore: string;
  loreVi: string;
  domains: DomainDef[];
  themeColors: {
    primary: string;
    secondary: string;
    accent: string;
    gradient: string;
  };
  eraName: string;
  eraNameVi: string;
}

export const PANTHEONS: PantheonDef[] = [
  {
    id: 'olympus',
    name: 'Olympus',
    nameVi: 'Olympus',
    origin: 'Greco-Roman',
    originVi: 'Hy Lạp — La Mã',
    description: 'The gods of Mount Olympus, born from Chaos and Titans. Rule through divine authority, political intrigue, and mortal champions.',
    descriptionVi: 'Các vị thần trên đỉnh Olympus, sinh ra từ Hỗn Mang và Titan. Cai trị qua quyền năng thần thánh, mưu đồ chính trị, và các anh hùng phàm nhân.',
    creatorGod: 'Primordial Deity',
    creatorGodVi: 'Nguyên Thần',
    lore: 'From Chaos came Gaia, Tartarus, and Eros. You awaken as a new divinity in the age after the Titanomachy. The Olympians rule, but their thrones are never truly secure.',
    loreVi: 'Từ Hỗn Mang sinh ra Gaia, Tartarus và Eros. Ngươi thức tỉnh như một vị thần mới trong kỷ nguyên sau cuộc chiến Titan. Các vị thần Olympus đang trị vì, nhưng ngôi vị của họ chưa bao giờ thực sự vững chắc.',
    domains: [
      { id: 'war_oly', name: 'War & Conquest', nameVi: 'Chiến Tranh & Chinh Phục', description: 'Like Ares — inspire armies, grant martial fury', descriptionVi: 'Như Ares — truyền cảm hứng chiến trận, ban phẫn nộ chiến đấu', bonuses: 'Thần Lực+20, Tín Đồ chiến binh mạnh hơn', startingPower: 120, icon: 'sword' },
      { id: 'wisdom_oly', name: 'Wisdom & Strategy', nameVi: 'Trí Tuệ & Mưu Lược', description: 'Like Athena — guide civilizations, grant knowledge', descriptionVi: 'Như Athena — dẫn dắt nền văn minh, ban tri thức', bonuses: 'Phát triển văn minh nhanh hơn', startingPower: 100, icon: 'eye' },
      { id: 'sea_oly', name: 'Sea & Storms', nameVi: 'Biển Cả & Bão Tố', description: 'Like Poseidon — command the oceans and earthquakes', descriptionVi: 'Như Poseidon — chỉ huy đại dương và động đất', bonuses: 'Thiên tai mạnh hơn, thương mại biển +50%', startingPower: 110, icon: 'lightning' },
      { id: 'death_oly', name: 'Underworld', nameVi: 'Âm Phủ', description: 'Like Hades — rule the dead, command shadows', descriptionVi: 'Như Hades — cai trị cõi chết, chỉ huy bóng tối', bonuses: 'Hồi sinh tín đồ, ám sát thần thánh', startingPower: 90, icon: 'shield' },
      { id: 'forge_oly', name: 'Forge & Fire', nameVi: 'Lò Rèn & Lửa', description: 'Like Hephaestus — create divine artifacts', descriptionVi: 'Như Hephaestus — tạo ra thần khí', bonuses: 'Đền thờ xây nhanh hơn, vũ khí thần thánh', startingPower: 95, icon: 'temple' },
    ],
    themeColors: {
      primary: '#c9a84c',
      secondary: '#7b8fa8',
      accent: '#d4a846',
      gradient: 'linear-gradient(145deg, #0f1117 0%, #1a1620 50%, #16181f 100%)',
    },
    eraName: 'Age of Olympians',
    eraNameVi: 'Kỷ Nguyên Olympus',
  },
  {
    id: 'asgard',
    name: 'Asgard',
    nameVi: 'Asgard',
    origin: 'Norse',
    originVi: 'Bắc Âu',
    description: 'The Aesir and Vanir of the Nine Realms. A world destined for Ragnarok — glory is fleeting, and every victory carries the seeds of doom.',
    descriptionVi: 'Aesir và Vanir của Chín Thế Giới. Một thế giới đã định sẵn Ragnarok — vinh quang chỉ là phù du, và mọi chiến thắng đều chứa mầm diệt vong.',
    creatorGod: 'Allfather',
    creatorGodVi: 'Toàn Phụ',
    lore: 'From the void of Ginnungagap, fire and ice collided to birth Ymir. The Aesir slew the giant and shaped the Nine Realms from his corpse. You arise as a new god amidst the branches of Yggdrasil.',
    loreVi: 'Từ hư vô Ginnungagap, lửa và băng va chạm sinh ra Ymir. Aesir giết người khổng lồ và tạo Chín Thế Giới từ xác hắn. Ngươi trỗi dậy như một vị thần mới giữa các cành của Yggdrasil.',
    domains: [
      { id: 'war_nor', name: 'Battle & Glory', nameVi: 'Chiến Trận & Vinh Quang', description: 'Like Thor — smite with thunder, inspire berserkers', descriptionVi: 'Như Thor — đánh bằng sấm sét, truyền cảm hứng cuồng chiến', bonuses: 'Chiến binh cuồng bạo, sét trời', startingPower: 130, icon: 'lightning' },
      { id: 'rune_nor', name: 'Runes & Prophecy', nameVi: 'Rune & Tiên Tri', description: 'Like Odin — sacrifice for wisdom, read the fates', descriptionVi: 'Như Odin — hy sinh để có trí tuệ, đọc vận mệnh', bonuses: 'Tiên tri sự kiện, phép rune', startingPower: 100, icon: 'eye' },
      { id: 'trick_nor', name: 'Trickery & Chaos', nameVi: 'Mưu Mẹo & Hỗn Loạn', description: 'Like Loki — shapeshift, deceive, cause chaos', descriptionVi: 'Như Loki — biến hình, lừa gạt, gây hỗn loạn', bonuses: 'Biến hình, phá hoại thần khác', startingPower: 85, icon: 'crown' },
      { id: 'nature_nor', name: 'Fertility & Harvest', nameVi: 'Phồn Thực & Mùa Màng', description: 'Like Freyr — bless harvests, ensure prosperity', descriptionVi: 'Như Freyr — ban phước mùa màng, đảm bảo thịnh vượng', bonuses: 'Tín đồ phát triển nhanh, nông nghiệp', startingPower: 95, icon: 'prayer' },
      { id: 'death_nor', name: 'Death & Fate', nameVi: 'Cái Chết & Số Mệnh', description: 'Like Hela — rule Niflheim, command the dishonored dead', descriptionVi: 'Như Hela — cai trị Niflheim, chỉ huy vong linh', bonuses: 'Kiểm soát người chết, lời nguyền', startingPower: 90, icon: 'shield' },
    ],
    themeColors: {
      primary: '#8faab5',
      secondary: '#5a7a8f',
      accent: '#a8c4d0',
      gradient: 'linear-gradient(145deg, #0a0f14 0%, #121a22 50%, #0e1318 100%)',
    },
    eraName: 'Age Before Ragnarok',
    eraNameVi: 'Thời Đại Trước Ragnarok',
  },
  {
    id: 'thien_dinh',
    name: 'Celestial Court',
    nameVi: 'Thiên Đình',
    origin: 'Chinese',
    originVi: 'Trung Hoa',
    description: 'The Jade Emperor presides over the Celestial Bureaucracy. Heaven mirrors the earthly court — rank, protocol, and mandate matter as much as divine power.',
    descriptionVi: 'Ngọc Hoàng ngự trị Thiên Đình. Thiên giới phản chiếu triều đình trần gian — phẩm hàm, nghi thức, và thiên mệnh quan trọng ngang sức mạnh thần thánh.',
    creatorGod: 'Primordial Creator',
    creatorGodVi: 'Sáng Thế Thần',
    lore: 'Pangu split Chaos into Heaven and Earth. Nuwa shaped humanity from clay. The Celestial Court formed to govern the cosmos with order and hierarchy. You emerge as a new deity seeking your place in this vast bureaucracy.',
    loreVi: 'Bàn Cổ khai thiên lập địa. Nữ Oa nặn loài người từ đất sét. Thiên Đình hình thành để cai quản vũ trụ bằng trật tự và đẳng cấp. Ngươi xuất hiện như một vị thần mới tìm chỗ đứng trong bộ máy thiên đình bao la.',
    domains: [
      { id: 'heaven_cn', name: 'Heavenly Mandate', nameVi: 'Thiên Mệnh', description: 'Like the Jade Emperor — bestow legitimacy, govern order', descriptionVi: 'Như Ngọc Hoàng — ban chính danh, cai trị trật tự', bonuses: 'Kiểm soát triều đình, thiên mệnh', startingPower: 100, icon: 'crown' },
      { id: 'nature_cn', name: 'Five Elements', nameVi: 'Ngũ Hành', description: 'Master Metal, Wood, Water, Fire, Earth — shape the world', descriptionVi: 'Làm chủ Kim, Mộc, Thuỷ, Hoả, Thổ — nhào nặn thế giới', bonuses: 'Cân bằng ngũ hành, phép thuật đa năng', startingPower: 110, icon: 'prayer' },
      { id: 'war_cn', name: 'Martial Heaven', nameVi: 'Thiên Binh Thiên Tướng', description: 'Like Guan Yu — command celestial armies', descriptionVi: 'Như Quan Vũ — chỉ huy thiên binh', bonuses: 'Thiên binh mạnh, trung thành tuyệt đối', startingPower: 120, icon: 'sword' },
      { id: 'wisdom_cn', name: 'Dao & Enlightenment', nameVi: 'Đạo & Giác Ngộ', description: 'Like Laozi — transcend through wisdom and cultivation', descriptionVi: 'Như Lão Tử — siêu thoát qua trí tuệ và tu luyện', bonuses: 'Tu luyện cấp thần nhanh, đệ tử mạnh', startingPower: 90, icon: 'eye' },
      { id: 'fortune_cn', name: 'Fortune & Prosperity', nameVi: 'Phúc Lộc Thọ', description: 'Like Caishen — bestow wealth, protect merchants', descriptionVi: 'Như Thần Tài — ban phát giàu sang, bảo hộ thương nhân', bonuses: 'Thu nhập tín đồ x2, thương mại thịnh vượng', startingPower: 95, icon: 'temple' },
    ],
    themeColors: {
      primary: '#c9564c',
      secondary: '#d4a846',
      accent: '#e8c170',
      gradient: 'linear-gradient(145deg, #100a0a 0%, #1a1210 50%, #140e0c 100%)',
    },
    eraName: 'Age of Celestial Order',
    eraNameVi: 'Kỷ Nguyên Thiên Đình',
  },
  {
    id: 'svarga',
    name: 'Svarga',
    nameVi: 'Svarga',
    origin: 'Indian / Hindu',
    originVi: 'Ấn Độ',
    description: 'The cosmic cycle of creation, preservation, and destruction. Devas and Asuras wage eternal war while Brahman pervades all. Karma shapes every destiny.',
    descriptionVi: 'Chu kỳ vũ trụ của sáng tạo, bảo tồn, và huỷ diệt. Deva và Asura giao chiến vĩnh hằng trong khi Brahman thấm nhuần vạn vật. Nghiệp quả định hình mọi số phận.',
    creatorGod: 'Cosmic Creator',
    creatorGodVi: 'Sáng Tạo Thần',
    lore: 'Brahma dreamed the universe into being. Vishnu preserves it. Shiva will dance its destruction. You manifest as a new aspect of the divine, your nature shaped by the cosmic forces you embody.',
    loreVi: 'Brahma mộng ra vũ trụ. Vishnu bảo tồn nó. Shiva sẽ múa điệu huỷ diệt. Ngươi hiện thân như một khía cạnh mới của thần tính, bản chất định hình bởi sức mạnh vũ trụ ngươi mang.',
    domains: [
      { id: 'create_in', name: 'Creation & Knowledge', nameVi: 'Sáng Tạo & Tri Thức', description: 'Like Brahma — create worlds, grant Vedic wisdom', descriptionVi: 'Như Brahma — tạo thế giới, ban trí tuệ Veda', bonuses: 'Sáng tạo thế giới mạnh, tri thức vô hạn', startingPower: 100, icon: 'book' },
      { id: 'preserve_in', name: 'Preservation & Dharma', nameVi: 'Bảo Tồn & Dharma', description: 'Like Vishnu — protect cosmic order through avatars', descriptionVi: 'Như Vishnu — bảo vệ trật tự vũ trụ qua hoá thân', bonuses: 'Hoá thân avatar, bảo vệ tín đồ', startingPower: 110, icon: 'shield' },
      { id: 'destroy_in', name: 'Destruction & Rebirth', nameVi: 'Huỷ Diệt & Tái Sinh', description: 'Like Shiva — destroy to create anew, cosmic dance', descriptionVi: 'Như Shiva — huỷ diệt để tái tạo, vũ điệu vũ trụ', bonuses: 'Thiên tai cực mạnh, tái sinh thế giới', startingPower: 120, icon: 'lightning' },
      { id: 'war_in', name: 'Divine Warfare', nameVi: 'Chiến Tranh Thần Thánh', description: 'Like Indra — command the Devas against Asuras', descriptionVi: 'Như Indra — chỉ huy Deva chống Asura', bonuses: 'Chiến binh thần thánh, sấm sét', startingPower: 115, icon: 'sword' },
      { id: 'karma_in', name: 'Karma & Destiny', nameVi: 'Nghiệp & Số Mệnh', description: 'Shape fate through the invisible threads of karma', descriptionVi: 'Định hình số phận qua sợi chỉ vô hình của nghiệp', bonuses: 'Kiểm soát vận mệnh NPC, luân hồi', startingPower: 90, icon: 'eye' },
    ],
    themeColors: {
      primary: '#d4874a',
      secondary: '#b85450',
      accent: '#e8a060',
      gradient: 'linear-gradient(145deg, #0f0c0a 0%, #1a1410 50%, #14100e 100%)',
    },
    eraName: 'Age of the Devas',
    eraNameVi: 'Kỷ Nguyên Deva',
  },
  {
    id: 'mictlan',
    name: 'Mictlan',
    nameVi: 'Mictlan',
    origin: 'Mesoamerican',
    originVi: 'Châu Mỹ (Aztec / Maya)',
    description: 'The Feathered Serpent and the Smoking Mirror. Gods who demand sacrifice and offer rebirth. The Fifth Sun burns — but for how long?',
    descriptionVi: 'Rắn Lông Vũ và Gương Khói. Các vị thần đòi hiến tế và ban tái sinh. Mặt Trời Thứ Năm đang cháy — nhưng còn được bao lâu?',
    creatorGod: 'Feathered Serpent',
    creatorGodVi: 'Rắn Lông Vũ',
    lore: 'Four Suns have risen and fallen. The Fifth Sun was born from divine sacrifice at Teotihuacan. You awaken as a new force in the cosmic drama — will you sustain this Sun or bring about the next?',
    loreVi: 'Bốn Mặt Trời đã mọc và tàn. Mặt Trời Thứ Năm sinh ra từ hiến tế thần thánh tại Teotihuacan. Ngươi thức tỉnh như một thế lực mới — ngươi sẽ duy trì Mặt Trời này hay đưa tới Mặt Trời tiếp theo?',
    domains: [
      { id: 'sun_am', name: 'Sun & Sacrifice', nameVi: 'Mặt Trời & Hiến Tế', description: 'Like Huitzilopochtli — the sun demands blood to rise', descriptionVi: 'Như Huitzilopochtli — mặt trời đòi máu để mọc', bonuses: 'Hiến tế = sức mạnh, mặt trời chiến tranh', startingPower: 120, icon: 'prayer' },
      { id: 'wind_am', name: 'Wind & Wisdom', nameVi: 'Gió & Trí Tuệ', description: 'Like Quetzalcoatl — civilize, educate, oppose sacrifice', descriptionVi: 'Như Quetzalcoatl — khai hoá, giáo dục, phản đối hiến tế', bonuses: 'Văn minh nhanh, phép gió, phản hiến tế', startingPower: 100, icon: 'eye' },
      { id: 'night_am', name: 'Night & Sorcery', nameVi: 'Đêm & Phù Thuỷ', description: 'Like Tezcatlipoca — master of darkness and fate', descriptionVi: 'Như Tezcatlipoca — chúa tể bóng tối và số mệnh', bonuses: 'Phù thuỷ, biến hình, thao túng', startingPower: 95, icon: 'crown' },
      { id: 'rain_am', name: 'Rain & Agriculture', nameVi: 'Mưa & Nông Nghiệp', description: 'Like Tlaloc — command rain, nurture or drown', descriptionVi: 'Như Tlaloc — gọi mưa, nuôi dưỡng hoặc nhấn chìm', bonuses: 'Mùa màng, lũ lụt, kiểm soát nước', startingPower: 100, icon: 'lightning' },
      { id: 'death_am', name: 'Death & Underworld', nameVi: 'Cái Chết & Âm Giới', description: 'Like Mictlantecuhtli — rule the nine layers of death', descriptionVi: 'Như Mictlantecuhtli — cai trị chín tầng âm giới', bonuses: 'Chín tầng địa ngục, linh hồn chiến binh', startingPower: 90, icon: 'shield' },
    ],
    themeColors: {
      primary: '#5a9e6f',
      secondary: '#c9564c',
      accent: '#70b882',
      gradient: 'linear-gradient(145deg, #0a0f0c 0%, #12181a 50%, #0e1410 100%)',
    },
    eraName: 'Era of the Fifth Sun',
    eraNameVi: 'Kỷ Nguyên Mặt Trời Thứ Năm',
  },
];

/** Get pantheon by id */
export function getPantheon(id: PantheonId): PantheonDef | undefined {
  return PANTHEONS.find(p => p.id === id);
}

/** Get all domain names for a pantheon */
export function getPantheonDomains(id: PantheonId): DomainDef[] {
  return getPantheon(id)?.domains || [];
}
