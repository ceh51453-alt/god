import { create } from 'zustand';
import { useConnectionStore } from './connectionStore';

export interface PresetPromptBlock {
  identifier: string;
  name: string;
  enabled: boolean;
  injection_position: number;  // 0 = system, 1 = in-chat depth
  injection_depth: number;     // depth from end for in-chat blocks
  injection_order: number;
  role: 'system' | 'assistant' | 'user' | string;
  content: string;
  system_prompt: boolean;
}

export type RegexScope = 'ai-display' | 'ai-prompt' | 'user-prompt';

export interface PresetRegex {
  order: number;
  scriptName: string;
  pattern: string;
  flags: string;
  replacement: string;
  targetUser: boolean;    // placement [1] — áp lên tin nhắn người dùng
  targetAI: boolean;      // placement [2] — áp lên phản hồi AI
  promptOnly: boolean;    // chỉ đổi prompt gửi đi (không đổi hiển thị/lưu)
  displayOnly: boolean;   // markdownOnly — chỉ đổi hiển thị, không đổi prompt
  trimStrings: string[];
}

export interface PresetData {
  id: string;
  name: string;
  prompts: PresetPromptBlock[];
  regexes: PresetRegex[];
  promptOrder: string[];  // thứ tự identifier từ prompt_order
}

interface PresetStore {
  activePreset: PresetData | null;
  loadPreset: (jsonData: any, filename: string) => void;
  clearPreset: () => void;
}

const PRESET_STORAGE_KEY = 'godsim_active_preset';

interface CompileResult {
  prompts: PresetPromptBlock[];
  regexes: PresetRegex[];
}

/**
 * Chuẩn hóa injection_position:
 * - Nếu undefined nhưng system_prompt=true → 0 (system)
 * - Nếu undefined → 0 (mặc định)
 */
function normalizePosition(block: any): number {
  if (typeof block.injection_position === 'number') return block.injection_position;
  if (block.system_prompt) return 0;
  return 0;
}

/**
 * Tiện ích: Xử lý macros SillyTavern cơ bản (setvar, getvar, regex)
 * Trả về mảng các block đã được resolve và mảng regex đã trích xuất.
 */
function compilePreset(prompts: PresetPromptBlock[]): CompileResult {
  const vars: Record<string, string> = {};
  const extractedRegexes: PresetRegex[] = [];
  
  // 1. Lọc block enabled (undefined coi như bật), chuẩn hóa content & injection_position
  let activeBlocks = prompts.filter(p => p.enabled !== false).map(p => ({
    ...p,
    content: p.content || '',
    injection_position: normalizePosition(p),
    injection_depth: typeof p.injection_depth === 'number' ? p.injection_depth : 0,
    injection_order: typeof p.injection_order === 'number' ? p.injection_order : 100,
  }));
  
  // 2. Trích xuất <regex>
  activeBlocks.forEach(block => {
    if (!block.content) return;
    
    const regexTag = /<regex(?:\s+order=(\d+))?[^>]*>"\/(.*?)\/([a-z]*)"\s*:\s*"([\s\S]*?)"<\/regex>/gs;
    let match;
    while ((match = regexTag.exec(block.content)) !== null) {
      extractedRegexes.push({
        order: parseInt(match[1] || '0', 10),
        scriptName: 'inline',
        pattern: match[2],
        flags: match[3],
        replacement: match[4],
        targetUser: false,
        targetAI: true,
        promptOnly: false,
        displayOnly: false,
        trimStrings: [],
      });
    }
    // Xóa <regex> tags
    block.content = block.content.replace(/<regex[^>]*>[\s\S]*?<\/regex>/g, '');
  });

  // 3. Pass 1: Thu thập {{setvar::key::value}}
  activeBlocks.forEach(block => {
    if (!block.content) return;
    const regex = /{{setvar::(.*?)::(.*?)}}/gs;
    let match;
    while ((match = regex.exec(block.content)) !== null) {
      const key = match[1];
      const value = match[2] || '';
      vars[key] = value;
    }
    block.content = block.content.replace(/{{setvar::.*?::.*?}}/gs, '');
  });

  // 4. Pass 2: Thay thế {{getvar::key}}
  activeBlocks.forEach(block => {
    if (!block.content) return;
    const regex = /{{getvar::(.*?)}}/g;
    block.content = block.content.replace(regex, (_, key) => {
      return vars[key] !== undefined ? vars[key] : '';
    });
  });

  // 5. Clean up
  activeBlocks.forEach(block => {
    block.content = block.content.trim();
  });

  return {
    prompts: activeBlocks.filter(b => b.content.length > 0),
    regexes: extractedRegexes.sort((a, b) => a.order - b.order)
  };
}

/**
 * Tách `findRegex` kiểu SillyTavern (thường là "/pattern/flags") thành pattern + flags.
 */
function parseFindRegex(findRegex: string): { pattern: string; flags: string } {
  const m = /^\/([\s\S]*)\/([a-z]*)$/i.exec(findRegex.trim());
  if (m) return { pattern: m[1], flags: m[2] || '' };
  return { pattern: findRegex, flags: '' };
}

/** ST dùng {{match}} cho toàn bộ khớp; JS dùng $&. */
function convertReplacement(r: string): string {
  return (r || '').replace(/\{\{match\}\}/g, '$&');
}

/**
 * Nạp regex từ extensions.regex_scripts (SillyTavern) → PresetRegex[].
 * placement: 1 = tin nhắn người dùng, 2 = phản hồi AI.
 */
function parseRegexScripts(scripts: any[]): PresetRegex[] {
  const out: PresetRegex[] = [];
  scripts.forEach((s, i) => {
    if (!s || s.disabled || !s.findRegex) return;
    const { pattern, flags } = parseFindRegex(String(s.findRegex));
    const gflags = flags.includes('g') ? flags : flags + 'g';
    const placement: number[] = Array.isArray(s.placement) ? s.placement : [];
    out.push({
      order: 1000 + i, // sau các regex inline
      scriptName: s.scriptName || `regex_${i}`,
      pattern,
      flags: gflags,
      replacement: convertReplacement(s.replaceString ?? ''),
      targetUser: placement.includes(1),
      targetAI: placement.includes(2),
      promptOnly: !!s.promptOnly,
      displayOnly: !!s.markdownOnly,
      trimStrings: Array.isArray(s.trimStrings) ? s.trimStrings : [],
    });
  });
  return out;
}

/**
 * Áp dụng regex của preset lên một đoạn text theo PHẠM VI:
 * - 'ai-display'  : làm sạch phản hồi AI để hiển thị & lưu (placement AI, không promptOnly)
 * - 'ai-prompt'   : biến đổi phản hồi AI khi đưa vào ngữ cảnh gửi lại (placement AI, không displayOnly)
 * - 'user-prompt' : biến đổi tin nhắn người dùng khi gửi (placement user, không displayOnly)
 */
export function applyPresetRegexes(text: string, scope: RegexScope = 'ai-display'): string {
  const preset = usePresetStore.getState().activePreset;
  if (!preset?.regexes || preset.regexes.length === 0) return text;

  let result = text;
  for (const rx of [...preset.regexes].sort((a, b) => a.order - b.order)) {
    // Lọc theo phạm vi
    if (scope === 'ai-display' && (!rx.targetAI || rx.promptOnly)) continue;
    if (scope === 'ai-prompt' && (!rx.targetAI || rx.displayOnly)) continue;
    if (scope === 'user-prompt' && (!rx.targetUser || rx.displayOnly)) continue;

    try {
      const pattern = new RegExp(rx.pattern, rx.flags);
      const replacement = rx.replacement
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t');
      result = result.replace(pattern, replacement);
    } catch (e) {
      console.error('Failed to apply regex:', rx.scriptName, e);
    }
  }
  return result;
}

export const usePresetStore = create<PresetStore>()((set) => {
  // Thử load từ localStorage khi khởi tạo
  let initialPreset: PresetData | null = null;
  try {
    const raw = localStorage.getItem(PRESET_STORAGE_KEY);
    if (raw) initialPreset = JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load preset from storage', e);
  }

  return {
    activePreset: initialPreset,
    
    loadPreset: (jsonData: any, filename: string) => {
      if (!jsonData || !Array.isArray(jsonData.prompts)) {
        throw new Error('Định dạng file không hợp lệ (không tìm thấy mảng prompts)');
      }
      
      const { prompts, regexes } = compilePreset(jsonData.prompts as PresetPromptBlock[]);

      // Nạp thêm regex từ extensions.regex_scripts (nơi SillyTavern thực sự lưu regex)
      const scriptRegexes = Array.isArray(jsonData?.extensions?.regex_scripts)
        ? parseRegexScripts(jsonData.extensions.regex_scripts)
        : [];
      const allRegexes: PresetRegex[] = [...regexes, ...scriptRegexes];

      // Trích xuất prompt_order nếu có
      let promptOrder: string[] = [];
      if (Array.isArray(jsonData.prompt_order)) {
        // prompt_order có thể là [{identifier, enabled}] hoặc [[charId, [{identifier, enabled}]]]
        const rawOrder = jsonData.prompt_order;
        if (rawOrder.length > 0 && Array.isArray(rawOrder[0])) {
          // Format: [[charId, orderArray]]
          const orderArr = rawOrder[0][1] || [];
          promptOrder = orderArr.filter((o: any) => o.enabled).map((o: any) => o.identifier);
        } else {
          promptOrder = rawOrder.filter((o: any) => o.enabled).map((o: any) => o.identifier);
        }
      }
      
      const preset: PresetData = {
        id: jsonData.id || filename,
        name: filename.replace('.json', ''),
        prompts,
        regexes: allRegexes,
        promptOrder,
      };
      
      // Chỉ lưu compiled data vào localStorage (không lưu originalJson ~1MB)
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(preset));
      set({ activePreset: preset });

      // Đồng bộ các tham số sampling (nếu có) vào cấu hình AI hiện tại
      try {
        const activeProfile = useConnectionStore.getState().getActiveProfile();
        if (activeProfile) {
          const sampling = { ...activeProfile.sampling };
          let hasChanges = false;
          
          const mapParam = (key: keyof typeof sampling, jsonKeys: string[]) => {
            for (const jsonKey of jsonKeys) {
              if (typeof jsonData[jsonKey] === 'number') {
                // @ts-ignore
                sampling[key] = jsonData[jsonKey];
                hasChanges = true;
                break;
              }
            }
          };

          mapParam('temperature', ['temperature']);
          mapParam('top_p', ['top_p']);
          mapParam('top_k', ['top_k']);
          mapParam('min_p', ['min_p']);
          mapParam('frequency_penalty', ['frequency_penalty']);
          mapParam('presence_penalty', ['presence_penalty']);
          mapParam('max_tokens', ['max_length', 'openai_max_tokens', 'claude_max_tokens', 'max_tokens']);
          mapParam('max_context_tokens', ['max_context_length', 'openai_max_context', 'claude_max_context', 'max_context_tokens']);
          
          if (hasChanges) {
            useConnectionStore.getState().updateProfile(activeProfile.id, { sampling });
          }
        }
      } catch (err) {
        console.error('Failed to sync sampling params:', err);
      }
    },
    
    clearPreset: () => {
      localStorage.removeItem(PRESET_STORAGE_KEY);
      set({ activePreset: null });
    },
  };
});
