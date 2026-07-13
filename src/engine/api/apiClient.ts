import { useConnectionStore, type ConnectionProfile, type ProviderPreset } from '@/stores/connectionStore';

/* ═══════════════════════════════════════════════════════
   API CLIENT — Proxy-aware, SSE streaming, auto-retry
   ═══════════════════════════════════════════════════════ */

interface ApiRequestOptions {
  messages: Array<{ role: string; content: string }>;
  onChunk?: (text: string) => void;
  onDone?: (fullText: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

interface RetryState {
  attempt: number;
  maxAttempts: number;
  onRetry?: (attempt: number, max: number) => void;
}

/** Build the fetch URL: if proxy is configured, route through it */
function buildUrl(profile: ConnectionProfile, path: string): string {
  const base = profile.baseUrl ? profile.baseUrl.replace(/\/+$/, '') : '';
  const url = `${base}${path}`;
  
  if (profile.proxyUrl) {
    const proxy = profile.proxyUrl.replace(/\/+$/, '');
    if (base) {
      // Encode the target URL as a query param for the proxy
      return `${proxy}?target=${encodeURIComponent(url)}`;
    } else {
      // If no base URL is provided, treat proxyUrl as the base URL
      return `${proxy}${path}`;
    }
  }
  
  return url;
}

/** Build headers based on provider preset */
function buildHeaders(profile: ConnectionProfile): Record<string, string> {
  const key = profile.apiKeys[profile.currentKeyIndex] || '';
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
      return {
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
    }

    case 'google': {
      return {
        contents: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : m.role === 'system' ? 'user' : m.role,
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          temperature: sampling.temperature,
          topP: sampling.top_p,
          topK: sampling.top_k || undefined,
          maxOutputTokens: sampling.max_tokens,
          ...(sampling.stop_sequences.length > 0 && { stopSequences: sampling.stop_sequences }),
        },
      };
    }

    default: // openai, custom
      return {
        model: profile.selectedModel || 'gpt-4o-mini',
        messages,
        temperature: sampling.temperature,
        top_p: sampling.top_p,
        max_tokens: sampling.max_tokens,
        frequency_penalty: sampling.frequency_penalty,
        presence_penalty: sampling.presence_penalty,
        stream: sampling.streaming,
        ...(sampling.top_k > 0 && { top_k: sampling.top_k }),
        ...(sampling.min_p > 0 && { min_p: sampling.min_p }),
        ...(sampling.seed !== null && { seed: sampling.seed }),
        ...(sampling.stop_sequences.length > 0 && { stop: sampling.stop_sequences }),
      };
  }
}

/** Parse SSE stream from different providers */
async function parseSSEStream(
  response: Response,
  provider: ProviderPreset,
  onChunk: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  try {
    while (true) {
      if (signal?.aborted) {
        reader.cancel();
        break;
      }

      const { done, value } = await reader.read();
      if (done) break;

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

          switch (provider) {
            case 'anthropic':
              if (json.type === 'content_block_delta') {
                chunk = json.delta?.text || '';
              }
              break;
            case 'google':
              chunk = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
              break;
            default: // openai
              chunk = json.choices?.[0]?.delta?.content || '';
          }

          if (chunk) {
            fullText += chunk;
            onChunk(chunk);
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }
  } finally {
    reader.releaseLock();
  }

  return fullText;
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
  const url = buildUrl(profile, '/models');
  const headers = buildHeaders(profile);

  const response = await fetch(url, { headers, method: 'GET' });
  if (!response.ok) {
    throw new Error(`Failed to scan models: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  // Handle different response formats
  if (Array.isArray(data)) return data.map((m: { id?: string }) => m.id || String(m));
  if (data.data && Array.isArray(data.data)) return data.data.map((m: { id?: string }) => m.id || String(m));
  if (data.models && Array.isArray(data.models)) return data.models.map((m: { id?: string }) => m.id || String(m));

  return [];
}

/** Test connection with a minimal request */
export async function testConnection(profile: ConnectionProfile): Promise<{ ok: boolean; latency: number; error?: string }> {
  const start = performance.now();
  try {
    const url = buildUrl(profile, '/chat/completions');
    const headers = buildHeaders(profile);
    const body = buildBody(profile, [{ role: 'user', content: 'ping' }]);
    // Override to minimal tokens
    (body as Record<string, unknown>).max_tokens = 5;
    if ('stream' in body) (body as Record<string, unknown>).stream = false;

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
  const store = useConnectionStore.getState();
  const profile = store.getActiveProfile();
  const maxAttempts = retryState?.maxAttempts ?? profile.retryCount;
  let attempt = retryState?.attempt ?? 0;

  while (attempt < maxAttempts) {
    try {
      const url = buildUrl(profile, '/chat/completions');
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
        if (isRetryableError(response.status)) {
          // Rotate key on 429/401 if multiple keys
          if ((response.status === 429 || response.status === 401) && profile.apiKeys.length > 1) {
            store.rotateKey(profile.id);
          }
          throw new Error(`HTTP ${response.status}`);
        }
        const errorText = await response.text().catch(() => '');
        throw new Error(`API Error ${response.status}: ${errorText || response.statusText}`);
      }

      // Streaming response
      if (profile.sampling.streaming && response.headers.get('content-type')?.includes('text/event-stream')) {
        const fullText = await parseSSEStream(response, profile.provider, (chunk) => {
          options.onChunk?.(chunk);
        }, options.signal);
        options.onDone?.(fullText);
        return fullText;
      }

      // Non-streaming response
      const data = await response.json();
      let text = '';
      switch (profile.provider) {
        case 'anthropic':
          text = data.content?.[0]?.text || '';
          break;
        case 'google':
          text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          break;
        default:
          text = data.choices?.[0]?.message?.content || '';
      }
      options.onDone?.(text);
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
