import { useConnectionStore, type ConnectionProfile, type ProviderPreset } from '@/stores/connectionStore';
import { usePresetStore } from '@/stores/presetStore';

/* ═══════════════════════════════════════════════════════
   API CLIENT — Proxy-aware, SSE streaming, auto-retry
   ═══════════════════════════════════════════════════════ */

/**
 * Bóc tách realtime thẻ <think>...</think> từ luồng text 
 * để đẩy vào khung UI Thinking.
 */
class ThinkTagParser {
  private buffer = '';
  private inThink = false;
  
  process(chunk: string, onText: (t: string) => void, onThink: (t: string) => void) {
    this.buffer += chunk;
    
    while (this.buffer.length > 0) {
      if (!this.inThink) {
        const startIndex = this.buffer.indexOf('<think>');
        if (startIndex === -1) {
          const lastLess = this.buffer.lastIndexOf('<');
          if (lastLess !== -1 && '<think>'.startsWith(this.buffer.slice(lastLess))) {
            if (lastLess > 0) {
               onText(this.buffer.slice(0, lastLess));
               this.buffer = this.buffer.slice(lastLess);
            }
            break;
          } else {
            onText(this.buffer);
            this.buffer = '';
          }
        } else {
          if (startIndex > 0) {
            onText(this.buffer.slice(0, startIndex));
          }
          this.inThink = true;
          this.buffer = this.buffer.slice(startIndex + 7);
        }
      } else {
        const endIndex = this.buffer.indexOf('</think>');
        if (endIndex === -1) {
          const lastLess = this.buffer.lastIndexOf('<');
          if (lastLess !== -1 && '</think>'.startsWith(this.buffer.slice(lastLess))) {
            if (lastLess > 0) {
               onThink(this.buffer.slice(0, lastLess));
               this.buffer = this.buffer.slice(lastLess);
            }
            break;
          } else {
            onThink(this.buffer);
            this.buffer = '';
          }
        } else {
          if (endIndex > 0) {
            onThink(this.buffer.slice(0, endIndex));
          }
          this.inThink = false;
          this.buffer = this.buffer.slice(endIndex + 8);
        }
      }
    }
  }
  
  flush(onText: (t: string) => void, onThink: (t: string) => void) {
    if (this.buffer) {
      if (this.inThink) onThink(this.buffer);
      else onText(this.buffer);
      this.buffer = '';
    }
  }
}

interface ApiRequestOptions {
  messages: Array<{ role: string; content: string }>;
  onChunk?: (text: string) => void;
  onThinkingChunk?: (text: string) => void;
  onDone?: (fullText: string, thinkingText: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

interface RetryState {
  attempt: number;
  maxAttempts: number;
  onRetry?: (attempt: number, max: number) => void;
}

/**
 * Chuẩn hóa URL người dùng nhập (Base URL / Proxy URL):
 * - trim khoảng trắng, thêm https:// nếu thiếu scheme, bỏ "/" thừa cuối
 * - cắt đuôi endpoint dán nhầm (/chat/completions, /v1/messages, :generateContent)
 *   — lỗi rất phổ biến khi copy URL từ hướng dẫn proxy.
 */
export function normalizeUserUrl(raw: string): string {
  let u = (raw || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
  u = u.replace(/\/+$/, '');
  u = u.replace(/\/chat\/completions$/i, '');
  u = u.replace(/\/v1\/messages$/i, '/v1');
  u = u.replace(/\/models\/[^/]+:(?:stream)?generatecontent[^/]*$/i, '');
  return u.replace(/\/+$/, '');
}

/** Đường dẫn endpoint chat theo provider — Anthropic/Gemini KHÔNG dùng /chat/completions */
function chatPath(profile: ConnectionProfile, streaming: boolean): string {
  switch (profile.provider) {
    case 'anthropic':
      return '/v1/messages';
    case 'google': {
      // Gemini: model nằm trong URL, stream cần :streamGenerateContent?alt=sse
      const model = profile.selectedModel || 'gemini-1.5-pro';
      return `/v1beta/models/${model}:${streaming ? 'streamGenerateContent?alt=sse' : 'generateContent'}`;
    }
    default: // openai, custom
      return '/chat/completions';
  }
}

/** Bỏ tiền tố version trùng nếu base HIỆU DỤNG đã chứa sẵn (vd .../v1).
    Base hiệu dụng = Base URL, hoặc Proxy URL khi proxy đóng vai trò base. */
function dedupeVersionPrefix(profile: ConnectionProfile, path: string): string {
  const eff = normalizeUserUrl(profile.baseUrl) || normalizeUserUrl(profile.proxyUrl);
  if (profile.provider === 'anthropic' && /\/v1$/.test(eff)) return path.replace(/^\/v1/, '');
  if (profile.provider === 'google' && /\/v1beta$/.test(eff)) return path.replace(/^\/v1beta/, '');
  return path;
}

/** URL endpoint chat hoàn chỉnh (đã tính proxy + provider) */
export function buildChatUrl(profile: ConnectionProfile, streaming: boolean): string {
  return buildUrl(profile, dedupeVersionPrefix(profile, chatPath(profile, streaming)));
}

/** URL endpoint liệt kê model theo provider */
export function buildModelsUrl(profile: ConnectionProfile): string {
  const path = profile.provider === 'anthropic' ? '/v1/models'
    : profile.provider === 'google' ? '/v1beta/models'
    : '/models';
  return buildUrl(profile, dedupeVersionPrefix(profile, path));
}

/** Build the fetch URL: if proxy is configured, route through it */
function buildUrl(profile: ConnectionProfile, path: string): string {
  const base = normalizeUserUrl(profile.baseUrl);
  const proxy = normalizeUserUrl(profile.proxyUrl);

  if (proxy) {
    if (base) {
      // Encode the target URL as a query param for the proxy.
      // Proxy có thể đã mang sẵn query (?key=...) → nối bằng '&' thay vì '?'.
      const sep = proxy.includes('?') ? '&' : '?';
      return `${proxy}${sep}target=${encodeURIComponent(base + path)}`;
    }
    // If no base URL is provided, treat proxyUrl as the base URL
    return `${proxy}${path}`;
  }

  return `${base}${path}`;
}

/** Build headers based on provider preset */
export function buildHeaders(profile: ConnectionProfile): Record<string, string> {
  // Clamp index — danh sách key có thể đã bị sửa ngắn lại sau khi index được lưu
  const keys = profile.apiKeys;
  const idx = keys.length > 0 ? ((profile.currentKeyIndex % keys.length) + keys.length) % keys.length : 0;
  const key = (keys[idx] || '').trim();
  const effectiveKey = key || profile.proxyPassword || '';
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  switch (profile.provider) {
    case 'anthropic':
      headers['x-api-key'] = effectiveKey;
      headers['anthropic-version'] = '2023-06-01';
      headers['anthropic-dangerous-direct-browser-access'] = 'true';
      break;
    case 'google':
      // Google uses API key in URL or header
      headers['x-goog-api-key'] = effectiveKey;
      break;
    default: // openai, custom
      if (effectiveKey) headers['Authorization'] = `Bearer ${effectiveKey}`;
  }

  // Proxy auth (cho các proxy server thực sự cần X-Proxy-Password)
  if (profile.proxyPassword) {
    headers['X-Proxy-Password'] = profile.proxyPassword;
  }

  return headers;
}

/** Build request body based on provider */
function buildBody(profile: ConnectionProfile, messages: Array<{ role: string; content: string }>) {
  const { sampling } = profile;

  switch (profile.provider) {
    case 'anthropic': {
      const systemMsg = messages.find(m => m.role === 'system');
      const chatMsgs = messages.filter(m => m.role !== 'system');
      const body: Record<string, unknown> = {
        model: profile.selectedModel || 'claude-3-5-sonnet-20240620',
        max_tokens: sampling.max_tokens,
        system: systemMsg?.content || '',
        messages: chatMsgs,
        temperature: sampling.temperature,
        top_p: sampling.top_p,
        top_k: sampling.top_k || undefined,
        stream: sampling.streaming,
        ...(sampling.stop_sequences.length > 0 && { stop_sequences: sampling.stop_sequences }),
      };
      if (sampling.thinking) {
        body.thinking = { type: 'enabled', budget_tokens: sampling.thinkingBudget };
        // Anthropic requires temperature=1 when thinking is enabled
        delete body.temperature;
        delete body.top_p;
        delete body.top_k;
        // max_tokens must be larger than budget_tokens
        if (sampling.max_tokens <= sampling.thinkingBudget) {
          body.max_tokens = sampling.thinkingBudget + sampling.max_tokens;
        }
      }
      return body;
    }

    case 'google': {
      const systemMsg = messages.find(m => m.role === 'system');
      const chatMsgs = messages.filter(m => m.role !== 'system');
      // Gemini tính token suy nghĩ VÀO maxOutputTokens. Nếu để nguyên max_tokens
      // (vd 2048) mà thinkingBudget lớn hơn (vd 10000) thì phần suy nghĩ ngốn hết
      // hạn ngạch → model dừng ở finishReason=MAX_TOKENS trước khi kịp viết câu
      // trả lời (triệu chứng: "cứ suy nghĩ mà không nhả nội dung"). Phải cộng thêm
      // budget để chừa chỗ cho phần trả lời.
      const maxOut = sampling.thinking && sampling.max_tokens <= sampling.thinkingBudget
        ? sampling.thinkingBudget + sampling.max_tokens
        : sampling.max_tokens;
      const body: Record<string, unknown> = {
        ...(systemMsg?.content ? { systemInstruction: { parts: [{ text: systemMsg.content }] } } : {}),
        contents: chatMsgs.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content || ' ' }],
        })),
        generationConfig: {
          temperature: sampling.temperature,
          topP: sampling.top_p,
          topK: sampling.top_k || undefined,
          maxOutputTokens: maxOut,
          frequencyPenalty: sampling.frequency_penalty,
          presencePenalty: sampling.presence_penalty,
          ...(sampling.stop_sequences.length > 0 && { stopSequences: sampling.stop_sequences }),
          // includeThoughts: true → Gemini mới trả về phần tóm tắt suy nghĩ để hiển thị.
          ...(sampling.thinking && { thinkingConfig: { thinkingBudget: sampling.thinkingBudget, includeThoughts: true } }),
        },
      };
      return body;
    }

    default: { // openai, custom
      // Với model reasoning (o1/o3, deepseek-r1, Gemini qua proxy OpenAI-compat...),
      // token suy nghĩ cũng bị tính vào max_tokens. max_tokens quá nhỏ so với
      // thinkingBudget → suy nghĩ ngốn hết, không còn chỗ viết câu trả lời. Nới thêm.
      const maxTok = sampling.thinking && sampling.max_tokens <= sampling.thinkingBudget
        ? sampling.thinkingBudget + sampling.max_tokens
        : sampling.max_tokens;
      const body: Record<string, unknown> = {
        model: profile.selectedModel || 'gpt-4o-mini',
        messages,
        temperature: sampling.temperature,
        top_p: sampling.top_p,
        max_tokens: maxTok,
        frequency_penalty: sampling.frequency_penalty,
        presence_penalty: sampling.presence_penalty,
        stream: sampling.streaming,
        ...(sampling.top_k > 0 && { top_k: sampling.top_k }),
        ...(sampling.min_p > 0 && { min_p: sampling.min_p }),
        ...(sampling.seed !== null && { seed: sampling.seed }),
        ...(sampling.stop_sequences.length > 0 && { stop: sampling.stop_sequences }),
      };
      if (sampling.thinking) {
        // OpenAI-compatible reasoning (works with o1, o3, deepseek-r1, etc.)
        body.include_reasoning = true;
      }
      return body;
    }
  }
}
/** Body tối giản 1 system + 1 user theo provider — cho các call nền (lorebook/enrich) */
export function buildSimpleBody(
  profile: ConnectionProfile,
  system: string,
  user: string,
  opts?: { maxTokens?: number; temperature?: number },
): Record<string, unknown> {
  const maxTokens = opts?.maxTokens ?? 1500;
  const temperature = opts?.temperature ?? 0.4;
  switch (profile.provider) {
    case 'anthropic':
      return {
        model: profile.selectedModel,
        system,
        messages: [{ role: 'user', content: user }],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      };
    case 'google':
      return {
        ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}),
        contents: [{ role: 'user', parts: [{ text: user || ' ' }] }],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      };
    default: // openai, custom
      return {
        model: profile.selectedModel,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        max_tokens: maxTokens,
        temperature,
        stream: false,
      };
  }
}

/** Rút text từ response non-stream theo provider */
export function extractResponseText(provider: ProviderPreset, data: any): string {
  switch (provider) {
    case 'anthropic': {
      const blocks = Array.isArray(data?.content) ? data.content : [];
      return blocks.filter((b: any) => b?.type === 'text').map((b: any) => b.text || '').join('');
    }
    case 'google': {
      const parts = data?.candidates?.[0]?.content?.parts || [];
      return parts.filter((p: any) => !p?.thought && p?.text).map((p: any) => p.text).join('');
    }
    default:
      return data?.choices?.[0]?.message?.content ?? '';
  }
}

/** Parse SSE stream from different providers */
async function parseSSEStream(
  response: Response,
  provider: ProviderPreset,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
  onThinkingChunk?: (text: string) => void,
  onActivity?: () => void,
): Promise<{ fullText: string; thinkingText: string }> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  const thinkParser = new ThinkTagParser();
  let buffer = '';
  let fullText = '';
  let thinkingText = '';
  let insideNativeThinking = false;
  // Track current Anthropic content block type
  let currentBlockType: 'text' | 'thinking' | null = null;
  // Lý do model dừng — để chẩn đoán "chỉ thinking không có nội dung" (MAX_TOKENS...)
  let finishReason: string | null = null;

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

      onActivity?.(); // reset watchdog: có dữ liệu mới đổ về

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (!trimmed.startsWith('data: ')) continue;

        try {
          const json = JSON.parse(trimmed.slice(6));
          let chunk = '';
          let thinkingChunk = '';

          switch (provider) {
            case 'anthropic':
              // Track content block type for thinking vs text
              if (json.type === 'content_block_start') {
                currentBlockType = json.content_block?.type === 'thinking' ? 'thinking' : 'text';
              } else if (json.type === 'content_block_stop') {
                currentBlockType = null;
              } else if (json.type === 'content_block_delta') {
                if (currentBlockType === 'thinking' && json.delta?.thinking) {
                  thinkingChunk = json.delta.thinking;
                } else if (json.delta?.text) {
                  chunk = json.delta.text;
                }
              } else if (json.type === 'message_delta' && json.delta?.stop_reason) {
                finishReason = json.delta.stop_reason;
              }
              break;
            case 'google': {
              // Google Gemini: check for thought in parts
              const parts = json.candidates?.[0]?.content?.parts;
              if (Array.isArray(parts)) {
                for (const part of parts) {
                  if (part.thought && part.text) {
                    thinkingChunk += part.text;
                  } else if (part.text) {
                    chunk += part.text;
                  }
                }
              }
              if (json.candidates?.[0]?.finishReason) {
                finishReason = json.candidates[0].finishReason;
              }
              break;
            }
            default: { // openai
              // Check for reasoning_content (DeepSeek, o1, o3, etc.)
              const delta = json.choices?.[0]?.delta;
              if (delta) {
                if (delta.reasoning_content) {
                  thinkingChunk = delta.reasoning_content;
                } else if (delta.reasoning) {
                  thinkingChunk = delta.reasoning;
                }
                if (delta.content) {
                  chunk = delta.content;
                }
              }
              if (json.choices?.[0]?.finish_reason) {
                finishReason = json.choices[0].finish_reason;
              }
              break;
            }
          }

          if (thinkingChunk) {
            if (usePresetStore.getState().activePreset) {
              if (!insideNativeThinking) {
                const prefix = '<think>\n';
                fullText += prefix;
                onChunk(prefix);
                insideNativeThinking = true;
              }
              fullText += thinkingChunk;
              onChunk(thinkingChunk);
            } else {
              thinkingText += thinkingChunk;
              onThinkingChunk?.(thinkingChunk);
            }
          }
          if (chunk) {
            if (usePresetStore.getState().activePreset) {
              if (insideNativeThinking) {
                const suffix = '\n</think>\n\n';
                fullText += suffix;
                onChunk(suffix);
                insideNativeThinking = false;
              }
              fullText += chunk;
              onChunk(chunk);
            } else {
              thinkParser.process(chunk, (text) => {
                fullText += text;
                onChunk(text);
              }, (thinkText) => {
                thinkingText += thinkText;
                onThinkingChunk?.(thinkText);
              });
            }
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }
  } finally {
    if (usePresetStore.getState().activePreset) {
      if (insideNativeThinking) {
        const suffix = '\n</think>\n\n';
        fullText += suffix;
        onChunk(suffix);
      }
    } else {
      thinkParser.flush((text) => {
        fullText += text;
        onChunk(text);
      }, (thinkText) => {
        thinkingText += thinkText;
        onThinkingChunk?.(thinkText);
      });
    }
    reader.releaseLock();
  }

  console.log(
    `[SSE] Kết thúc stream — nội dung: ${fullText.length} ký tự, suy nghĩ: ${thinkingText.length} ký tự, finishReason: ${finishReason ?? 'không rõ'}`
  );
  if (!fullText.trim() && /MAX_TOKENS|length/i.test(finishReason ?? '')) {
    console.warn('[SSE] Model dừng vì hết token khi CHƯA viết nội dung — tăng Max Tokens hoặc giảm Thinking Budget.');
  }

  return { fullText, thinkingText };
}

/** Determine if an error is retryable */
function isRetryableError(status: number): boolean {
  return [429, 500, 502, 503, 504].includes(status);
}

/** Calculate backoff delay with jitter */
function getBackoffDelay(attempt: number): number {
  const base = Math.min(1000 * Math.pow(2, attempt), 16000);
  const jitter = Math.random() * 500;
  return base + jitter;
}

/** Mask API key for logging: show first 4 + last 4 chars */
export function maskKey(key: string): string {
  if (key.length <= 8) return '****';
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}

/* ── Main API Functions ── */

/** Scan available models from the endpoint */
export async function scanModels(profile: ConnectionProfile): Promise<string[]> {
  const url = buildModelsUrl(profile);
  const headers = buildHeaders(profile);

  const response = await fetch(url, { headers, method: 'GET' });
  if (!response.ok) {
    throw new Error(`Failed to scan models: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle different response formats (OpenAI {data}, Anthropic {data}, Gemini {models:[{name}]})
  const list: unknown[] = Array.isArray(data) ? data
    : Array.isArray(data.data) ? data.data
    : Array.isArray(data.models) ? data.models
    : [];
  return list.map((m: any) => {
    if (typeof m === 'string') return m;
    if (typeof m?.id === 'string') return m.id;
    if (typeof m?.name === 'string') return m.name.replace(/^models\//, '');
    return String(m);
  });
}

/** Test connection with a minimal request */
export async function testConnection(profile: ConnectionProfile): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now();
  try {
    const url = buildChatUrl(profile, false);
    const headers = buildHeaders(profile);
    const body = buildBody(profile, [{ role: 'user', content: 'ping' }]) as Record<string, any>;
    // Ping tối giản: bỏ thinking (budget lớn hơn max_tokens sẽ bị API từ chối)
    delete body.thinking;
    if (body.generationConfig) {
      body.generationConfig.maxOutputTokens = 16;
      delete body.generationConfig.thinkingConfig;
    } else {
      body.max_tokens = 16;
    }
    if ('stream' in body) body.stream = false;

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(10000),
    });

    const latency = Math.round(performance.now() - start);

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      return { ok: false, latency, error: `${response.status}: ${errorText || response.statusText}` };
    }

    return { ok: true, latency };
  } catch (err) {
    const latency = Math.round(performance.now() - start);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return { ok: false, latency, error: message };
  }
}

/** Send chat completion with streaming + auto-retry */
export async function sendChat(
  options: ApiRequestOptions,
  retryState?: RetryState,
): Promise<string> {
  const maxAttempts = retryState?.maxAttempts
    ?? useConnectionStore.getState().getActiveProfile().retryCount;
  let attempt = retryState?.attempt ?? 0;

  while (attempt < maxAttempts) {
    // Đọc profile MỚI mỗi lần thử — key có thể đã xoay sau 401/403/429;
    // nếu chụp một lần ngoài vòng lặp, retry vẫn dùng key cũ (xoay vô dụng).
    const store = useConnectionStore.getState();
    const profile = store.getActiveProfile();
    try {
      const url = buildChatUrl(profile, !!profile.sampling.streaming);
      const headers = buildHeaders(profile);
      const body = buildBody(profile, options.messages);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), profile.timeoutMs);

      // Combine external signal with timeout
      if (options.signal) {
        options.signal.addEventListener('abort', () => controller.abort());
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        // 401/403 (key chết/sai proxy password) và 429 (rate limit): nếu còn
        // key khác thì xoay + thử lại. Trước đây 401 nằm ngoài isRetryableError
        // nên nhánh xoay key là code chết — fail luôn không xoay.
        const canRotate = (response.status === 401 || response.status === 403 || response.status === 429)
          && profile.apiKeys.length > 1;
        if (canRotate) store.rotateKey(profile.id);
        if (isRetryableError(response.status) || canRotate) {
          throw new Error(`HTTP ${response.status}`);
        }
        const errorText = await response.text().catch(() => '');
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Streaming response
      if (profile.sampling.streaming && response.headers.get('content-type')?.includes('text/event-stream')) {
        // Watchdog: fetch timeout đã bị clear ở trên, nên nếu proxy giữ kết nối
        // treo (không đổ dữ liệu) thì stream sẽ chờ mãi. Abort nếu im lặng quá lâu.
        // Nới rộng hơn timeoutMs vì model reasoning có thể "suy nghĩ" âm thầm khá lâu.
        const idleLimit = Math.max(profile.timeoutMs, 60000);
        let idleTimer = setTimeout(() => controller.abort(), idleLimit);
        const resetIdle = () => {
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => controller.abort(), idleLimit);
        };
        try {
          const { fullText, thinkingText } = await parseSSEStream(response, profile.provider, (chunk) => {
            options.onChunk?.(chunk);
          }, options.signal, options.onThinkingChunk, resetIdle);
          // Người chơi đã hủy — KHÔNG commit lượt dở dang qua onDone
          if (options.signal?.aborted) return fullText;
          // Lỗi trong onDone (xử lý sau stream) không được kích hoạt retry gửi lại
          try {
            options.onDone?.(fullText, thinkingText);
          } catch (cbErr) {
            console.error('[sendChat] onDone handler error:', cbErr);
          }
          return fullText;
        } finally {
          clearTimeout(idleTimer);
        }
      }

      // Non-streaming response
      const data = await response.json();
      let text = '';
      let thinkingText = '';
      switch (profile.provider) {
        case 'anthropic': {
          // Anthropic returns array of content blocks; separate thinking from text
          const blocks = data.content || [];
          for (const block of blocks) {
            if (block.type === 'thinking') {
              thinkingText += block.thinking || '';
            } else if (block.type === 'text') {
              text += block.text || '';
            }
          }
          break;
        }
        case 'google': {
          const parts = data.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.thought && part.text) {
              thinkingText += part.text;
            } else if (part.text) {
              text += part.text;
            }
          }
          break;
        }
        default: {
          const msg = data.choices?.[0]?.message;
          text = msg?.content || '';
          thinkingText = msg?.reasoning_content || msg?.reasoning || '';
          break;
        }
      }

      // ────────────────────────────────────────────────────────
      // Trích xuất thẻ <think> từ nội dung text (do Preset sinh ra)
      // hoặc chuyển native thinking thành <think> nếu có Preset
      // ────────────────────────────────────────────────────────
      if (usePresetStore.getState().activePreset) {
        if (thinkingText) {
          text = `<think>\n${thinkingText}\n</think>\n\n${text}`;
          thinkingText = '';
        }
      } else {
        const thinkMatch = text.match(/<think>([\s\S]*?)<\/think>/i);
        if (thinkMatch) {
          // Nối thêm vào thinkingText nếu đã có sẵn từ native API
          thinkingText = thinkingText 
            ? thinkingText + '\n\n' + thinkMatch[1].trim()
            : thinkMatch[1].trim();
          // Xóa bỏ thẻ khỏi nội dung chính
          text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        }
      }

      if (options.signal?.aborted) return text;
      try {
        options.onDone?.(text, thinkingText);
      } catch (cbErr) {
        console.error('[sendChat] onDone handler error:', cbErr);
      }
      return text;

    } catch (err) {
      attempt++;
      const error = err instanceof Error ? err : new Error(String(err));

      if (attempt >= maxAttempts || options.signal?.aborted) {
        options.onError?.(error);
        throw error;
      }

      // Notify retry
      retryState?.onRetry?.(attempt, maxAttempts);

      // Wait with backoff
      const delay = getBackoffDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Max retries exceeded');
}
