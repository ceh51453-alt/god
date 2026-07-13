import { create } from 'zustand';
import { useConnectionStore } from './connectionStore';

export interface PresetPromptBlock {
  identifier: string;
  name: string;
  enabled: boolean;
  injection_position: number;
  injection_depth: number;
  injection_order: number;
  role: 'system' | 'assistant' | 'user' | string;
  content: string;
  system_prompt: boolean;
}

export interface PresetRegex {
  order: number;
  pattern: string;
  flags: string;
  replacement: string;
}

export interface PresetData {
  id: string;
  name: string;
  prompts: PresetPromptBlock[];
  regexes: PresetRegex[];
  originalJson: any;
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
 * Tiện ích: Xử lý macros SillyTavern cơ bản (setvar, getvar, regex)
 * Trả về mảng các block đã được resolve và mảng regex đã trích xuất.
 */
function compilePreset(prompts: PresetPromptBlock[]): CompileResult {
  const vars: Record<string, string> = {};
  const extractedRegexes: PresetRegex[] = [];
  
  // 1. Lọc block enabled và chuẩn hóa content
  let activeBlocks = prompts.filter(p => p.enabled).map(p => ({
    ...p,
    content: p.content || ''
  }));
  
  // 2. Trích xuất <regex>
  activeBlocks.forEach(block => {
    if (!block.content) return;
    
    const regexTag = /<regex(?:\s+order=(\d+))?[^>]*>"\/(.*?)\/([a-z]*)"\s*:\s*"([\s\S]*?)"<\/regex>/gs;
    let match;
    while ((match = regexTag.exec(block.content)) !== null) {
      extractedRegexes.push({
        order: parseInt(match[1] || '0', 10),
        pattern: match[2],
        flags: match[3],
        replacement: match[4]
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
      
      const preset: PresetData = {
        id: jsonData.id || filename,
        name: filename.replace('.json', ''),
        prompts,
        regexes,
        originalJson: jsonData
      };
      
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
