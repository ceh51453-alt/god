/* ═══════════════════════════════════════════════════════
   RAG — Retrieval Augmented Generation for God Simulator
   Provides contextual lore/knowledge injection into prompts
   ═══════════════════════════════════════════════════════ */

import type { GamePath, CharacterData } from '@/components/creation/creationData';

export interface LoreEntry {
  id: string;
  category: string;
  tags: string[];
  content: string;
  relevance: number; // 0-1
}

/** Core lore database — expandable */
const LORE_DB: LoreEntry[] = [
  // ── Creator Path ──
  { id: 'creator_genesis', category: 'genesis', tags: ['creator', 'void', 'creation'],
    content: 'Trước khi có ánh sáng, trước cả bóng tối — chỉ có Hư Vô. Trong Hư Vô vô tận ấy, một ý thức đầu tiên thức tỉnh. Đó là ngươi — Đấng Sáng Tạo.',
    relevance: 1 },
  { id: 'creator_laws', category: 'cosmology', tags: ['creator', 'laws', 'physics'],
    content: 'Mỗi vũ trụ cần có quy luật nền tảng: Trọng lực, Thời gian, Nhân quả, Sinh tử. Đấng Sáng Tạo có thể lựa chọn, thay đổi, hoặc phá vỡ bất kỳ quy luật nào.',
    relevance: 0.9 },
  { id: 'creator_pantheon', category: 'pantheon', tags: ['creator', 'gods', 'hierarchy'],
    content: 'Khi Đấng Sáng Tạo tạo ra thần linh, mỗi vị thần nhận được một phần quyền năng. Thần linh có thể trung thành, nổi loạn, hoặc phát triển ý thức độc lập.',
    relevance: 0.85 },
  { id: 'creator_life', category: 'biology', tags: ['creator', 'life', 'species'],
    content: 'Sinh mệnh có thể được tạo ra từ nhiều nguồn: đất đá, ánh sáng, năng lượng thuần túy, hoặc ý niệm. Mỗi loại sinh mệnh có đặc tính khác nhau.',
    relevance: 0.8 },
  { id: 'creator_challenge', category: 'crisis', tags: ['creator', 'void', 'entropy'],
    content: 'Hư Vô không bao giờ thực sự biến mất — nó luôn ở rìa vũ trụ, chờ đợi nuốt chửng mọi sáng tạo. Entropy là kẻ thù tự nhiên của Sáng Tạo.',
    relevance: 0.75 },

  // ── God Path ──
  { id: 'god_worship', category: 'faith', tags: ['god', 'worship', 'believers'],
    content: 'Sức mạnh của thần linh tỷ lệ thuận với lòng sùng kính. Càng nhiều tín đồ thành tâm, quyền năng càng mạnh mẽ. Nhưng nếu tín đồ mất niềm tin, thần linh sẽ suy yếu.',
    relevance: 1 },
  { id: 'god_domains', category: 'domains', tags: ['god', 'power', 'domains'],
    content: 'Miền quyền năng định nghĩa bản chất thần thánh: Chiến tranh, Mưa gió, Sấm sét, Tình yêu, Chết chóc, Rèn đúc... Thần linh có thể mở rộng hoặc thay đổi miền quyền năng theo thời gian.',
    relevance: 0.95 },
  { id: 'god_politics', category: 'divine_politics', tags: ['god', 'alliance', 'war'],
    content: 'Thần giới có chính trị riêng: liên minh, phản bội, chiến tranh thần thánh. Vị thần khôn ngoan biết khi nào nên kết đồng minh, khi nào nên độc lập.',
    relevance: 0.9 },
  { id: 'god_avatar', category: 'manifestation', tags: ['god', 'avatar', 'mortal_world'],
    content: 'Thần linh có thể giáng lâm trần thế qua hóa thân (Avatar). Mỗi lần hiện thân tiêu hao quyền năng, nhưng cho phép can thiệp trực tiếp vào phàm giới.',
    relevance: 0.85 },
  { id: 'god_miracle', category: 'miracles', tags: ['god', 'miracle', 'intervention'],
    content: 'Phép lạ là cách thần linh can thiệp vào phàm giới: chữa bệnh, tai ương, tiên tri, phục sinh. Mỗi phép lạ đều có cái giá — cân bằng vũ trụ sẽ đòi lại.',
    relevance: 0.8 },

  // ── Mortal Path ──
  { id: 'mortal_cultivation', category: 'cultivation', tags: ['mortal', 'cultivation', 'power'],
    content: 'Phàm nhân có thể tu luyện để vượt qua giới hạn: Luyện Thể → Luyện Khí → Trúc Cơ → Kim Đan → Nguyên Anh → Hóa Thần → Phong Thần. Mỗi cảnh giới mở ra khả năng mới.',
    relevance: 1 },
  { id: 'mortal_faction', category: 'society', tags: ['mortal', 'faction', 'politics'],
    content: 'Thế giới phàm nhân đầy phe phái: triều đình, giáo phái, bang hội, bộ tộc. Mỗi thế lực có mục tiêu, đồng minh, và kẻ thù riêng.',
    relevance: 0.95 },
  { id: 'mortal_divine_touch', category: 'divine_contact', tags: ['mortal', 'god', 'destiny'],
    content: 'Thỉnh thoảng, thần linh để mắt đến một phàm nhân — ban phúc hoặc giáng họa. Những phàm nhân được thần linh chạm vào có tiềm năng phong thần.',
    relevance: 0.9 },
  { id: 'mortal_combat', category: 'combat', tags: ['mortal', 'fight', 'martial'],
    content: 'Chiến đấu trong thế giới này không chỉ là vũ lực — mưu lược, liên minh, tâm lý chiến đều quan trọng. Kẻ mạnh nhất chưa chắc là kẻ thắng cuối cùng.',
    relevance: 0.85 },
  { id: 'mortal_items', category: 'artifacts', tags: ['mortal', 'items', 'weapons'],
    content: 'Thần khí, linh dược, bí kíp — những bảo vật có thể thay đổi cục diện. Nhưng mỗi bảo vật đều có lịch sử và giá trị của nó, không dễ dàng sở hữu.',
    relevance: 0.8 },

  // ── Shared ──
  { id: 'shared_balance', category: 'cosmology', tags: ['creator', 'god', 'mortal', 'balance'],
    content: 'Vũ trụ luôn tìm kiếm cân bằng: Sáng tạo — Hủy diệt, Trật tự — Hỗn mang, Sinh — Tử. Phá vỡ cân bằng sẽ có hậu quả không lường trước.',
    relevance: 0.7 },
  { id: 'shared_fate', category: 'destiny', tags: ['creator', 'god', 'mortal', 'fate'],
    content: 'Vận mệnh có thể được dệt bởi Đấng Sáng Tạo, can thiệp bởi thần linh, nhưng luôn bị ảnh hưởng bởi ý chí tự do của phàm nhân.',
    relevance: 0.65 },
];

/**
 * Retrieve relevant lore for a given context.
 * Returns up to `limit` entries sorted by relevance.
 */
export function retrieveLore(
  path: GamePath,
  keywords: string[],
  limit: number = 4,
): LoreEntry[] {
  const normalizedKeywords = keywords.map(k => k.toLowerCase());

  const scored = LORE_DB
    .filter(entry => entry.tags.includes(path) || entry.tags.includes('all'))
    .map(entry => {
      let score = entry.relevance;
      // Boost if keywords match tags
      for (const kw of normalizedKeywords) {
        if (entry.tags.some(t => t.includes(kw))) score += 0.2;
        if (entry.content.toLowerCase().includes(kw)) score += 0.1;
      }
      return { entry, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map(s => s.entry);
}

/**
 * Build a RAG context block to inject into the system prompt.
 */
export function buildRAGContext(
  path: GamePath,
  userMessage: string,
  character: CharacterData,
): string {
  // Extract keywords from user message
  const keywords = userMessage
    .toLowerCase()
    .split(/[\s,.\-?!]+/)
    .filter(w => w.length > 2);

  // Add character-specific keywords
  if (character.divineRealm) keywords.push(...character.divineRealm.toLowerCase().split(/\s+/));
  if (character.cosmicDomain) keywords.push(character.cosmicDomain);
  if (character.mortalClass) keywords.push(character.mortalClass);

  const lore = retrieveLore(path, keywords, 3);

  if (lore.length === 0) return '';

  const loreText = lore
    .map(l => `[${l.category.toUpperCase()}] ${l.content}`)
    .join('\n');

  return `\n=== KIẾN THỨC LIÊN QUAN ===\n${loreText}\n(Sử dụng kiến thức trên một cách tự nhiên, không trích dẫn trực tiếp)\n`;
}

/**
 * Generate the opening narrative prompt for each path.
 */
export function getOpeningPrompt(path: GamePath, character: CharacterData): string {
  switch (path) {
    case 'creator':
      return `Hãy bắt đầu câu chuyện sáng thế. Mô tả cảnh Hư Vô nguyên thủy — trước khi có bất cứ thứ gì. ${character.name ? `Đấng Sáng Tạo "${character.name}"` : 'Ta'} vừa thức tỉnh ý thức đầu tiên trong vô tận. Hãy mô tả cảm giác đó bằng văn phong sử thi, rồi hỏi ta muốn sáng tạo điều gì đầu tiên.${character.cosmicDomain ? ` Miền khởi nguyên: ${character.cosmicDomain}.` : ''}${character.crisis && character.crisis !== 'custom' ? ` Khủng hoảng đầu tiên đang ẩn hiện: liên quan đến ${character.crisis}.` : ''}`;

    case 'god':
      return `Hãy bắt đầu câu chuyện. Mô tả cảnh ${character.name ? `vị thần "${character.name}"` : 'ta'} ${character.divineRealm ? `— thần của ${character.divineRealm} —` : ''} đang ở trong thần giới. ${character.faction ? `Thuộc thần hệ ${character.faction}.` : 'Là một vị thần độc lập.'} ${character.era ? `Kỷ nguyên: ${character.era}.` : ''} Hãy mô tả quang cảnh thần giới xung quanh, tình hình hiện tại, rồi trình bày tình huống đầu tiên cần ta quyết định.${character.crisis && character.crisis !== 'custom' ? ` Khủng hoảng hiện tại: ${character.crisis}.` : ''}`;

    case 'mortal':
      return `Hãy bắt đầu câu chuyện. Mô tả cảnh ${character.name ? `"${character.name}"` : 'ta'} ${character.mortalClass ? `— ${character.mortalClass} —` : ''} trong ${character.region || 'một vùng đất'} vào ${character.era || 'thời đại loạn'}. ${character.faction ? `Thuộc phe ${character.faction}.` : ''} Hãy mô tả chi tiết hoàn cảnh hiện tại — nơi ta đang ở, xung quanh có gì, thời tiết, không khí — rồi trình bày thách thức hoặc cơ hội đầu tiên.${character.crisis && character.crisis !== 'custom' ? ` Khốn cảnh đang đối mặt: ${character.crisis}.` : ''}`;

    default:
      return 'Hãy bắt đầu câu chuyện.';
  }
}
