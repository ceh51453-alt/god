/* ═══════════════════════════════════════════════════════
   PROMPT BUILDER — Context assembly with priority budget
   Assembles the full prompt from: system instructions,
   state block, lore/RAG, MVU instruction, and chat history.
   Prioritized context budget allocation.
   ═══════════════════════════════════════════════════════ */

import type { StatData } from '../mvu/schema';
import type { ChatMessage } from '@/stores/chatStore';
import type { GamePath, CharacterData } from '@/components/creation/creationData';
import { renderStateForAI, buildMvuInstructionPrompt } from '../mvu/stateRenderer';
import { buildRAGContext } from '../rag/ragEngine';
import { staticRules } from '../mechanics/pathMechanics';
import { summarizeStudioForAI } from '../studio/studioSync';
import type { StudioEntity } from '@/components/studio/studioTypes';
import { usePresetStore, applyPresetRegexes } from '@/stores/presetStore';
import { activateLorebook } from '../lorebook/lorebookEngine';

export interface PromptMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface PromptBuildOptions {
  /** Current game state */
  statData: StatData;
  /** Path selection */
  path: GamePath;
  /** Character data */
  character: CharacterData;
  /** Full chat history */
  messages: ChatMessage[];
  /** Current user message */
  userMessage: string;
  /** Studio creations to inject as world context (Creator path) */
  studioEntities?: StudioEntity[];
  /** Approximate token budget (chars * 0.3 ≈ tokens) */
  maxContextChars?: number;
}

/**
 * Build the full prompt with prioritized context budget.
 *
 * Priority order (high → low):
 * 1. [MANDATORY] System instructions + MVU update rules
 * 2. [MANDATORY] Current state rendered block
 * 3. [HIGH]      Active lore entries (RAG)
 * 4. [MEDIUM]    Recent chat history
 * 5. [LOW]       Older chat history (trimmed first)
 */
export function buildPrompt(options: PromptBuildOptions): PromptMessage[] {
  const {
    statData, path, character, messages,
    userMessage, studioEntities = [], maxContextChars = 30000,
  } = options;

  const result: PromptMessage[] = [];
  let charBudget = maxContextChars;

  // ── 0. Load Preset ──
  const preset = usePresetStore.getState().activePreset;
  let presetSystemBlocks: { content: string; identifier: string }[] = [];
  let presetDepthBlocks: { content: string; depth: number; identifier: string }[] = [];

  if (preset) {
    // Sort blocks: use promptOrder if available, else injection_order
    let orderedPrompts = [...preset.prompts];
    if (preset.promptOrder && preset.promptOrder.length > 0) {
      const orderMap = new Map(preset.promptOrder.map((id, idx) => [id, idx]));
      orderedPrompts.sort((a, b) => {
        const ia = orderMap.get(a.identifier) ?? 9999;
        const ib = orderMap.get(b.identifier) ?? 9999;
        return ia - ib;
      });
    } else {
      orderedPrompts.sort((a, b) => a.injection_order - b.injection_order);
    }

    for (const p of orderedPrompts) {
      if (p.injection_position === 0 || (p.injection_position as any) === undefined) {
        // System-level blocks
        presetSystemBlocks.push({ content: p.content, identifier: p.identifier });
      } else if (p.injection_position === 1) {
        // In-chat depth blocks
        presetDepthBlocks.push({ content: p.content, depth: p.injection_depth || 0, identifier: p.identifier });
      }
    }
  }

  // ── 1. System prompt (mandatory) ──
  const systemBase = buildSystemPrompt(path, character);
  const mvuInstruction = buildMvuInstructionPrompt();
  
  const presetSystemContent = presetSystemBlocks.map(b => b.content).join('\n\n');
  
  const systemContent = presetSystemContent 
    ? `${presetSystemContent}\n\n--- HỆ THỐNG MVU GAME ---\n\n${systemBase}\n\n${mvuInstruction}`
    : `${systemBase}\n\n${mvuInstruction}`;

  charBudget -= systemContent.length;

  // ── 2. State block (mandatory) ──
  const stateBlock = renderStateForAI(statData);
  charBudget -= stateBlock.length;

  // Combine system + state
  result.push({
    role: 'system',
    content: `${systemContent}\n\n${stateBlock}`,
  });

  // ── 3. RAG context (high priority) ──
  const ragContext = buildRAGContext(path, userMessage, character);
  if (ragContext) {
    charBudget -= ragContext.length;
    // Inject as a system-level addition
    result[0].content += `\n${ragContext}`;
  }

  // ── 3b. Studio world context (Creator path) ──
  if (path === 'creator' && studioEntities.length > 0) {
    const studioBlock = summarizeStudioForAI(studioEntities);
    if (studioBlock) {
      charBudget -= studioBlock.length;
      result[0].content += `\n\n${studioBlock}`;
    }
  }

  // ── 3c. Narrative style & game settings ──
  const settingsBlock = renderSettingsForAI(statData.settings);
  charBudget -= settingsBlock.length;
  result[0].content += `\n\n${settingsBlock}`;

  // ── 3d. Lorebook / World Info (kích hoạt theo key, constant, đệ quy...) ──
  const loreScan = messages
    .filter(m => m.role !== 'system' && !m.streaming)
    .map(m => ({ role: m.role, content: m.content }));
  loreScan.push({ role: 'user', content: userMessage });
  const lore = activateLorebook(loreScan, statData._turnCount);
  const wiParts = [
    lore.injection.before, lore.injection.after,
    lore.injection.anTop, lore.injection.anBottom,
  ].filter(Boolean);
  if (wiParts.length) {
    const wiBlock = `\n\n=== SỔ TRI THỨC (WORLD INFO) ===\n${wiParts.join('\n\n')}`;
    charBudget -= wiBlock.length;
    result[0].content += wiBlock;
  }

  // ── 4-5. Chat history (fill remaining budget) ──
  const chatMessages = messages
    .filter(m => m.role !== 'system' && !m.streaming)
    .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

  // Add messages from most recent, trimming oldest if over budget
  const historyToAdd: PromptMessage[] = [];
  let historyChars = 0;

  for (let i = chatMessages.length - 1; i >= 0; i--) {
    const msg = chatMessages[i];
    const msgLen = msg.content.length;
    if (historyChars + msgLen > charBudget) break;
    historyToAdd.unshift(msg);
    historyChars += msgLen;
  }

  result.push(...historyToAdd);

  // ── 5b. Insert in-chat depth blocks at correct positions ──
  if (presetDepthBlocks.length > 0) {
    // injection_depth = number of messages from the end to insert before
    // depth=0 means at the very end (just before user message)
    // depth=1 means before the last message in history, etc.
    for (const block of presetDepthBlocks) {
      const insertIdx = Math.max(1, result.length - block.depth); // never before system prompt
      result.splice(insertIdx, 0, { role: 'system', content: block.content });
    }
  }

  // ── 5c. Lorebook @depth blocks (role: system/user/assistant) ──
  for (const block of lore.injection.depthBlocks) {
    const roleName: PromptMessage['role'] = block.role === 1 ? 'user' : block.role === 2 ? 'assistant' : 'system';
    const insertIdx = Math.max(1, result.length - block.depth);
    result.splice(insertIdx, 0, { role: roleName, content: block.content });
  }

  // Add current user message
  result.push({ role: 'user', content: userMessage });

  // ── 6. Apply Preset Regexes to outgoing prompts (theo vai) ──
  result.forEach(msg => {
    if (!msg.content) return;
    if (msg.role === 'assistant') msg.content = applyPresetRegexes(msg.content, 'ai-prompt');
    else if (msg.role === 'user') msg.content = applyPresetRegexes(msg.content, 'user-prompt');
    // system: giữ nguyên (preset đã tự lắp ráp)
  });

  return result;
}

/**
 * Build base system prompt for each path.
 */
function buildSystemPrompt(path: GamePath, character: CharacterData): string {
  const charName = character.name || 'người chơi';

  const commonRules = `
LUẬT CHUNG:
- Ngươi là Vận Mệnh — người dẫn chuyện AI. Kể chuyện bằng văn phong sử thi, giàu hình ảnh.
- KHÔNG lặp lại y nguyên trạng thái dưới dạng liệt kê. Hòa thông tin vào lời kể tự nhiên.
- Luôn kết bằng 1-2 lựa chọn hoặc tình huống để người chơi phản ứng.
- Thông tin trong "TRẠNG THÁI HIỆN TẠI" là SỰ THẬT. Nếu mâu thuẫn với trí nhớ, LẤY TRẠNG THÁI LÀM CHUẨN.
- Khi có thay đổi trạng thái, THÊM khối <UpdateVariable> ở cuối (xem hướng dẫn bên dưới).
- CÓ THỂ dùng các thẻ ngữ nghĩa đặc biệt khi phù hợp:
  <divine_decree>Chiếu chỉ thần thánh</divine_decree>
  <cosmic_event scale="lớn">Sự kiện vũ trụ</cosmic_event>
  <creation_report type="sinh mệnh">Báo cáo sáng tạo</creation_report>
  <quest_update status="mới">Nhiệm vụ</quest_update>
  <npc_dialogue>Lời thoại NPC</npc_dialogue>
`.trim();

  const intros: Record<GamePath, string> = {
    creator: `Ngươi đang dẫn chuyện cho ${charName} — một ĐẤNG SÁNG TẠO.
${charName} có quyền năng tạo ra vũ trụ, thần linh, sinh mệnh, quy luật.
Mọi sáng tạo đều có hệ quả. Hư Vô luôn rình rập ở rìa vũ trụ.`,
    god: `Ngươi đang dẫn chuyện cho ${charName} — một VỊ THẦN.
${charName} là thần linh${character.divineRealm ? ` của ${character.divineRealm}` : ''}, sức mạnh phụ thuộc vào tín đồ và lòng sùng kính.`,
    mortal: `Ngươi đang dẫn chuyện cho ${charName} — một PHÀM NHÂN.
${charName}${character.mortalClass ? ` là ${character.mortalClass}` : ''} trong một thế giới đầy thần linh và nguy hiểm.`,
  };

  return [intros[path] ?? '', commonRules, staticRules(path)]
    .filter(Boolean)
    .join('\n\n');
}

/**
 * Render narrative style & game settings into an instruction block.
 */
function renderSettingsForAI(s: StatData['settings']): string {
  const style: Record<string, string> = {
    epic: 'SỬ THI — hùng tráng, giàu hình ảnh, khí thế',
    dark: 'U ÁM — nặng nề, bi tráng, ám ảnh',
    romantic: 'LÃNG MẠN — giàu cảm xúc, tinh tế, tình cảm',
    humorous: 'HÀI HƯỚC — dí dỏm, nhẹ nhàng, châm biếm duyên dáng',
    gritty: 'TRẦN TRỤI — thực tế, khốc liệt, không tô hồng',
    poetic: 'THI VỊ — bay bổng, ẩn dụ, đậm chất thơ',
  };
  const len: Record<string, string> = {
    short: 'NGẮN GỌN (2-3 đoạn súc tích)',
    medium: 'VỪA PHẢI (3-5 đoạn)',
    long: 'DÀI & CHI TIẾT (5+ đoạn, đào sâu cảm xúc và bối cảnh)',
  };
  const pace: Record<string, string> = {
    slow: 'CHẬM RÃI — tập trung chi tiết, nội tâm, không vội',
    normal: 'CÂN BẰNG',
    fast: 'NHANH — dồn dập sự kiện, đẩy cốt truyện tiến nhanh',
  };
  const diff: Record<string, string> = {
    easy: 'DỄ — ưu ái người chơi, ít trừng phạt',
    balanced: 'CÂN BẰNG — công bằng, có rủi ro thật',
    realistic: 'THỰC TẾ — hệ quả nghiêm khắc, sai lầm phải trả giá',
  };
  const lines = [
    '=== PHONG CÁCH & THIẾT LẬP KỂ CHUYỆN (tuân thủ) ===',
    `Văn phong: ${style[s.narrativeStyle] ?? s.narrativeStyle}.`,
    `Độ dài phản hồi: ${len[s.responseLength] ?? s.responseLength}.`,
    `Nhịp truyện: ${pace[s.pacing] ?? s.pacing}.`,
    `Độ khó: ${diff[s.difficulty] ?? s.difficulty}.`,
    s.narrativeMode === 'guided'
      ? 'Chế độ DẪN DẮT: luôn gợi ý 2-3 lựa chọn rõ ràng ở cuối mỗi lượt.'
      : 'Chế độ TỰ DO: để người chơi tự quyết, không ép buộc lựa chọn.',
    s.maturity === 'mature'
      ? 'Nội dung NGƯỜI LỚN: cho phép chủ đề nặng, bạo lực, đen tối khi hợp cảnh (vẫn bám hướng người chơi).'
      : 'Nội dung AN TOÀN: tránh mô tả quá bạo lực hay nhạy cảm.',
  ];
  return lines.join('\n');
}

/**
 * Estimate token count from character count.
 * Very rough: ~1 token per 3-4 chars for Vietnamese/mixed text.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/**
 * Get total estimated tokens for a message array.
 */
export function estimatePromptTokens(messages: PromptMessage[]): number {
  return messages.reduce((sum, m) => sum + estimateTokens(m.content) + 4, 0); // +4 per message overhead
}
