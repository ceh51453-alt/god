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
import { usePresetStore, applyPresetRegexes } from '@/stores/presetStore';

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
    userMessage, maxContextChars = 30000,
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

  // Add current user message
  result.push({ role: 'user', content: userMessage });

  // ── 6. Apply Preset Regexes to outgoing prompts ──
  result.forEach(msg => {
    if (msg.content) {
      msg.content = applyPresetRegexes(msg.content);
    }
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
