import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { sendChat } from '@/engine/api/apiClient';
import { useConnectionStore } from '@/stores/connectionStore';
import { applyPresetRegexes } from '@/stores/presetStore';
import { getOpeningPrompt } from '@/engine/rag/ragEngine';
import { buildPrompt, estimatePromptTokens } from '@/engine/prompt/promptBuilder';
import { parseNarrativeTags } from '@/engine/narrative/tagParser';
import { extractStudioCreations } from '@/engine/studio/studioSync';
import { useStudioStore } from '@/components/studio/studioStore';
import { runEnrich } from '@/engine/studio/enrichEngine';
import { useEnrichStore } from '@/stores/enrichStore';
import { activateLorebook, commitLorebook, runLorebookMaintenance } from '@/engine/lorebook/lorebookEngine';
import { useLorebookStore } from '@/stores/lorebookStore';
import { NarrativeSegments } from './NarrativeTag';
import { SendIcon, LoaderIcon, DivinePowerIcon } from '@/ui/icons';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import './ChatPanel.css';

marked.setOptions({ breaks: true, gfm: true });

function renderMarkdown(text: string): string {
  const raw = marked.parse(text) as string;
  return DOMPurify.sanitize(raw);
}

export const ChatPanel: React.FC = () => {
  const {
    messages, isStreaming, streamingText, streamingThinkingText, retryingAttempt, retryingMax,
    addMessage, setStreaming, appendStreamText, appendStreamThinkingText, setRetrying,
    updateLastAssistantMessage, game, setGame,
    statData, processAIResponse, initStatData,
    pendingDecree, setPendingDecree,
  } = useChatStore(useShallow(s => ({
    messages: s.messages,
    isStreaming: s.isStreaming,
    streamingText: s.streamingText,
    streamingThinkingText: s.streamingThinkingText,
    retryingAttempt: s.retryingAttempt,
    retryingMax: s.retryingMax,
    addMessage: s.addMessage,
    setStreaming: s.setStreaming,
    appendStreamText: s.appendStreamText,
    appendStreamThinkingText: s.appendStreamThinkingText,
    setRetrying: s.setRetrying,
    updateLastAssistantMessage: s.updateLastAssistantMessage,
    game: s.game,
    setGame: s.setGame,
    statData: s.statData,
    processAIResponse: s.processAIResponse,
    initStatData: s.initStatData,
    pendingDecree: s.pendingDecree,
    setPendingDecree: s.setPendingDecree,
  })));

  const [inputText, setInputText] = useState('');
  const [autoTriggered, setAutoTriggered] = useState(false);
  const [hideOld, setHideOld] = useState(true);   // chống lag: ẩn lượt cũ
  const [rewinds, setRewinds] = useState(0);       // số lần đã quay lại (tối đa 3)
  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const path = game.path;
  const pathAccent = path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8';

  const placeholder = !game.gameStarted ? 'Cấu hình kết nối trước...' :
    path === 'creator' ? 'Ngươi muốn sáng tạo điều gì...' :
    path === 'god' ? 'Thần dụ, hành động, hoặc can thiệp...' :
    'Hành động, lời nói, hoặc quyết định...';

  const scrollToBottom = useCallback(() => {
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // ── Initialize MVU state when game starts ──
  useEffect(() => {
    if (game.gameStarted && game.path && statData._turnCount === 0 && statData.name === '') {
      initStatData(game.character, game.path);
    }
  }, [game.gameStarted, game.path, statData._turnCount, statData.name, game.character, initStatData]);

  // ── Auto-trigger opening narrative ──
  useEffect(() => {
    if (!game.gameStarted || autoTriggered) return;
    const storyMessages = messages.filter(m => m.role !== 'system');
    if (storyMessages.length > 0) {
      setAutoTriggered(true);
      return;
    }

    const profile = useConnectionStore.getState().getActiveProfile();
    if (!(profile.baseUrl || profile.proxyUrl) || !profile.selectedModel) return;

    setAutoTriggered(true);
    const openingPrompt = getOpeningPrompt(path!, game.character);
    triggerAI(openingPrompt);
  }, [game.gameStarted, autoTriggered, messages, path]);

  // ── Core send function with Prompt Builder ──
  const triggerAI = useCallback(async (userText: string) => {
    const profile = useConnectionStore.getState().getActiveProfile();
    if (!(profile.baseUrl || profile.proxyUrl) || !profile.selectedModel) {
      useChatStore.getState().setShowSettings(true);
      return;
    }

    setRewinds(0); // lượt mới → reset bộ đếm quay lại
    addMessage({ role: 'user', content: userText });
    addMessage({ role: 'assistant', content: '', streaming: true });
    setStreaming(true);
    scrollToBottom();

    const abortController = new AbortController();
    abortRef.current = abortController;

    // ── Build prompt with full pipeline ──
    const currentState = useChatStore.getState();
    const promptMessages = buildPrompt({
      statData: currentState.statData,
      path: path!,
      character: game.character,
      messages: currentState.messages.filter(m => !m.streaming),
      userMessage: userText,
      studioEntities: useStudioStore.getState().entities,
    });

    const tokenEst = estimatePromptTokens(promptMessages);
    console.log(`[Prompt] ${promptMessages.length} messages, ~${tokenEst} tokens`);

    try {
      await sendChat({
        messages: promptMessages,
        onChunk: (chunk) => {
          appendStreamText(chunk);
          scrollToBottom();
        },
        onThinkingChunk: (chunk) => {
          appendStreamThinkingText(chunk);
          scrollToBottom();
        },
        onDone: (full, thinkingText) => {
          // ── Apply Preset Regexes to AI response ──
          const regexed = applyPresetRegexes(full);

          // ── Auto-ghi tạo vật vào Xưởng Sáng Thế (chỉ Sáng Thế Thần) ──
          const { text: stripped, creations } = extractStudioCreations(regexed);
          if (path === 'creator' && creations.length > 0) {
            for (const c of creations) {
              const studio = useStudioStore.getState();
              const existing = studio.entities.find(
                e => e.category === c.category &&
                  e.name.trim().toLowerCase() === c.name.trim().toLowerCase()
              );
              if (existing) {
                // Cập nhật: chỉ ghi đè trường AI cung cấp không rỗng
                const merged = { ...existing.values };
                for (const [k, v] of Object.entries(c.values)) {
                  const emptyStr = typeof v === 'string' && v.trim() === '';
                  const emptyArr = Array.isArray(v) && v.length === 0;
                  if (!emptyStr && !emptyArr) merged[k] = v;
                }
                studio.update(existing.id, { values: merged });
              } else {
                studio.add(c);
              }
            }
          }

          // ── Process AI response through MVU extractor ──
          const { cleanText, patches } = processAIResponse(stripped);

          // If no patches were extracted, just update the message normally
          if (patches.length === 0) {
            updateLastAssistantMessage(cleanText || stripped, thinkingText || undefined);
            setGame({ turnCount: game.turnCount + 1 });
          } else {
            // processAIResponse already updates message; but need to add thinkingText
            if (thinkingText) {
              const store = useChatStore.getState();
              const msgs = [...store.messages];
              for (let i = msgs.length - 1; i >= 0; i--) {
                if (msgs[i].role === 'assistant') {
                  msgs[i] = { ...msgs[i], thinkingText };
                  break;
                }
              }
              useChatStore.setState({ messages: msgs });
            }
          }

          setStreaming(false);
          setRetrying(null);
          scrollToBottom();

          // ── Lorebook: ghi runtime (sticky/cooldown/delay) + bảo trì cuối lượt ──
          try {
            const turn = useChatStore.getState().statData._turnCount;
            const scan = useChatStore.getState().messages
              .filter(m => m.role !== 'system' && !m.streaming)
              .map(m => ({ role: m.role, content: m.content }));
            const act = activateLorebook(scan, turn);
            commitLorebook(act.activeUids, act.matchedDelayedUids, turn);
          } catch { /* noop */ }
          if (useLorebookStore.getState().settings.autoUpdate) {
            runLorebookMaintenance(cleanText || stripped).catch(err =>
              console.warn('[Lorebook] Background error:', err)
            );
          }

          // ── Auto-Enrich: bổ sung fields cho entity trong Xưởng Sáng Thế ──
          const enrichState = useEnrichStore.getState();
          if (enrichState.enabled && enrichState.trigger === 'after-response') {
            runEnrich(cleanText || stripped).catch(err =>
              console.warn('[Enrich] Background error:', err)
            );
          }
        },
        onError: () => {
          setStreaming(false);
          setRetrying(null);
        },
        signal: abortController.signal,
      }, {
        attempt: 0,
        maxAttempts: profile.retryCount,
        onRetry: (attempt, max) => {
          setRetrying(attempt, max);
        },
      });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Unknown error';
      updateLastAssistantMessage(`Error: ${error}`);
      setStreaming(false);
      setRetrying(null);
    }
  }, [path, game, addMessage, setStreaming, appendStreamText, appendStreamThinkingText,
      updateLastAssistantMessage, setRetrying, scrollToBottom, setGame,
      processAIResponse, statData]);

  // ── Nhận "Lời Tuyên Sáng Thế" từ Xưởng Sáng Thế ──
  useEffect(() => {
    if (!pendingDecree || isStreaming || !game.gameStarted) return;
    const decree = pendingDecree;
    setPendingDecree(null);
    triggerAI(decree);
  }, [pendingDecree, isStreaming, game.gameStarted, setPendingDecree, triggerAI]);

  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    setInputText('');
    triggerAI(text);
  }, [inputText, isStreaming, triggerAI]);

  const handleAbort = useCallback(() => {
    abortRef.current?.abort();
    const thinkingSnap = useChatStore.getState().streamingThinkingText || undefined;
    setStreaming(false);
    setRetrying(null);
    if (streamingText) {
      updateLastAssistantMessage(streamingText + '\n\n[Gián đoạn]', thinkingSnap);
    }
  }, [setStreaming, setRetrying, streamingText, updateLastAssistantMessage]);

  // ── Reroll handler ──
  const handleReroll = useCallback((msgId: string) => {
    if (isStreaming) return;
    const store = useChatStore.getState();
    const msgIdx = store.messages.findIndex(m => m.id === msgId);
    if (msgIdx < 0) return;

    // Find the user message before this assistant message
    let userMsg = '';
    for (let i = msgIdx - 1; i >= 0; i--) {
      if (store.messages[i].role === 'user') {
        userMsg = store.messages[i].content;
        break;
      }
    }

    if (!userMsg) return;

    // Rollback state to before this message's patches were applied
    const msg = store.messages[msgIdx];
    if (msg.turnNumber != null) {
      store.rollbackToTurn(msg.turnNumber);
    }

    // Re-send
    triggerAI(userMsg);
  }, [isStreaming, triggerAI]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const displayMessages = messages.filter(m => m.role !== 'system');

  // ── Chống lag: chỉ render các lượt gần nhất khi bật ──
  const RECENT_MSGS = 8; // ~4 lượt
  const hiddenCount = hideOld ? Math.max(0, displayMessages.length - RECENT_MSGS) : 0;
  const visibleMessages = hiddenCount > 0 ? displayMessages.slice(-RECENT_MSGS) : displayMessages;

  // ── Quay lại lượt (tối đa 3) ──
  const handleRewind = useCallback(() => {
    if (isStreaming || rewinds >= 3) return;
    const ok = useChatStore.getState().rewindOneTurn();
    if (ok) setRewinds(r => r + 1);
  }, [isStreaming, rewinds]);

  return (
    <div className="chat-panel" style={{ '--chat-accent': pathAccent } as React.CSSProperties}>
      {/* Messages */}
      <div className="chat-messages">
        {displayMessages.length > 0 && (
          <div className="chat-toolbar">
            <button
              className="chat-tool-btn"
              disabled={isStreaming || rewinds >= 3}
              onClick={handleRewind}
              title="Quay lại lượt trước (tối đa 3 lượt gần nhất)"
            >
              ↶ Quay Lại{rewinds > 0 ? ` (${rewinds}/3)` : ''}
            </button>
            <button
              className={`chat-tool-btn ${hideOld ? 'chat-tool-btn--on' : ''}`}
              onClick={() => setHideOld(v => !v)}
              title="Ẩn các lượt cũ để giảm lag khi hội thoại dài"
              style={hideOld ? { color: pathAccent, borderColor: `${pathAccent}55` } : undefined}
            >
              {hideOld ? 'Ẩn Lượt Cũ: BẬT' : 'Ẩn Lượt Cũ: TẮT'}
            </button>
          </div>
        )}
        {hiddenCount > 0 && (
          <button className="chat-loadmore" onClick={() => setHideOld(false)}>
            Đang ẩn {hiddenCount} lượt cũ để chống lag — bấm để hiện tất cả
          </button>
        )}
        {displayMessages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-icon">
              <DivinePowerIcon size={48} color={pathAccent} />
            </div>
            <h3 className="chat-empty-title" style={{ color: pathAccent }}>
              {path === 'creator' ? 'Hư Vô Chờ Đợi' :
               path === 'god' ? 'Thần Giới Khai Mở' :
               path === 'mortal' ? 'Vận Mệnh Khởi Đầu' : 'Thức Tỉnh Thần Tính'}
            </h3>
            <p className="chat-empty-text">
              {!game.gameStarted
                ? 'Hãy cấu hình kết nối API và tạo nhân vật để bắt đầu.'
                : path === 'creator'
                ? 'Hư Vô nguyên thủy đang chờ ý chí sáng tạo đầu tiên. Đấng Sáng Tạo, ngươi sẵn sàng chưa?'
                : path === 'god'
                ? 'Thần giới đang rung chuyển. Vị thần, ngươi đã sẵn sàng giáng lâm.'
                : 'Loạn thế đang chờ đợi. Vận mệnh của ngươi bắt đầu từ đây.'}
            </p>
            {game.gameStarted && displayMessages.length === 0 && !isStreaming && (
              <button
                className="chat-start-btn"
                style={{ borderColor: `${pathAccent}40`, color: pathAccent }}
                onClick={() => {
                  const profile = useConnectionStore.getState().getActiveProfile();
                  if (!(profile.baseUrl || profile.proxyUrl) || !profile.selectedModel) {
                    useChatStore.getState().setShowSettings(true);
                    return;
                  }
                  const openingPrompt = getOpeningPrompt(path!, game.character);
                  triggerAI(openingPrompt);
                }}
              >
                <DivinePowerIcon size={16} color={pathAccent} />
                {path === 'creator' ? 'Bắt Đầu Sáng Tạo' :
                 path === 'god' ? 'Giáng Lâm' : 'Bước Vào Loạn Thế'}
              </button>
            )}
          </div>
        )}

        {visibleMessages.map((msg) => {
          // Parse narrative tags for assistant messages
          const segments = msg.role === 'assistant' && !msg.streaming
            ? parseNarrativeTags(msg.cleanContent || msg.content)
            : null;

          return (
            <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
              <div className="chat-msg-avatar">
                {msg.role === 'user' ? (
                  <div className="avatar avatar--user" style={{ borderColor: `${pathAccent}40` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 20C5 17 8 14 12 14C16 14 19 17 19 20" />
                    </svg>
                  </div>
                ) : (
                  <div className="avatar avatar--god" style={{
                    background: `${pathAccent}15`,
                    borderColor: `${pathAccent}30`,
                    color: pathAccent,
                  }}>
                    <DivinePowerIcon size={16} color={pathAccent} />
                  </div>
                )}
              </div>
              <div className="chat-msg-content">
                <span className="chat-msg-label">
                  {msg.role === 'user' ? (game.godName || 'Ngươi') : 'Vận Mệnh'}
                </span>
                {msg.streaming && isStreaming ? (
                  <>
                    {streamingThinkingText && (
                      <ThinkingBlock
                        content={streamingThinkingText}
                        isStreaming={true}
                        accentColor={pathAccent}
                      />
                    )}
                    <div
                      className="chat-msg-text"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText || '') }}
                    />
                  </>
                ) : segments ? (
                  <>
                    {msg.thinkingText && (
                      <ThinkingBlock
                        content={msg.thinkingText}
                        isStreaming={false}
                        accentColor={pathAccent}
                      />
                    )}
                    <NarrativeSegments segments={segments} />
                  </>
                ) : (
                  <>
                    {msg.thinkingText && (
                      <ThinkingBlock
                        content={msg.thinkingText}
                        isStreaming={false}
                        accentColor={pathAccent}
                      />
                    )}
                    <div
                      className="chat-msg-text"
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                    />
                  </>
                )}
                {msg.streaming && isStreaming && (
                  <span className="chat-cursor" style={{ background: pathAccent }} />
                )}

                {/* Reroll & State Change Indicator */}
                {msg.role === 'assistant' && !msg.streaming && !isStreaming && (
                  <div className="chat-msg-actions">
                    {msg.patches && msg.patches.length > 0 && (
                      <span className="chat-state-badge" style={{ color: pathAccent }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                        </svg>
                        {msg.patches.length} thay đổi
                      </span>
                    )}
                    <button
                      className="chat-reroll-btn"
                      onClick={() => handleReroll(msg.id)}
                      title="Tạo lại phản hồi"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 4v6h6" />
                        <path d="M23 20v-6h-6" />
                        <path d="M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Retry indicator */}
        {retryingAttempt !== null && (
          <div className="chat-retry">
            <LoaderIcon size={14} color={pathAccent} />
            <span>Thử lại... ({retryingAttempt}/{retryingMax})</span>
            <button className="btn btn-sm" onClick={handleAbort}>Hủy</button>
          </div>
        )}

        <div ref={chatEndRef} />

        {/* Enrich status indicator */}
        <EnrichIndicator />
      </div>

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-row glass-light">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder={placeholder}
            value={inputText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isStreaming}
          />
          {isStreaming ? (
            <button className="btn btn-icon chat-send-btn chat-stop-btn" onClick={handleAbort} title="Dừng">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--accent-danger)" stroke="none">
                <rect x="6" y="6" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              className="btn btn-icon btn-primary chat-send-btn"
              onClick={handleSend}
              disabled={!inputText.trim()}
              title="Gửi"
              style={{ background: inputText.trim() ? `${pathAccent}20` : undefined }}
            >
              <SendIcon size={18} color={inputText.trim() ? pathAccent : 'var(--text-muted)'} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
/* ── Thinking Block ── */
const ThinkingBlock: React.FC<{
  content: string;
  isStreaming: boolean;
  accentColor: string;
}> = ({ content, isStreaming, accentColor }) => {
  const [isOpen, setIsOpen] = React.useState(isStreaming);

  // Auto-open when streaming starts, close when done
  React.useEffect(() => {
    if (isStreaming) setIsOpen(true);
  }, [isStreaming]);

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className={`chat-thinking ${isStreaming ? 'chat-thinking--streaming' : ''}`}>
      <button
        className="chat-thinking-toggle"
        onClick={() => setIsOpen(!isOpen)}
        style={{ '--thinking-accent': accentColor } as React.CSSProperties}
      >
        <svg
          className={`chat-thinking-icon ${isStreaming ? 'chat-thinking-icon--pulse' : ''}`}
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke={accentColor} strokeWidth="1.5"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
          <path d="M12 6c-2.2 0-4 1.8-4 4 0 1.5.8 2.7 2 3.4V15h4v-1.6c1.2-.7 2-1.9 2-3.4 0-2.2-1.8-4-4-4z" />
          <path d="M10 17h4M10 19h4" />
        </svg>
        <span className="chat-thinking-label">
          {isStreaming ? 'Đang suy nghĩ...' : `Suy nghĩ (${wordCount} từ)`}
        </span>
        <svg
          className={`chat-thinking-chevron ${isOpen ? 'chat-thinking-chevron--open' : ''}`}
          width="12" height="12" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {isOpen && (
        <div
          className="chat-thinking-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
        />
      )}
    </div>
  );
};

/* ── Enrich Status Indicator ── */
const EnrichIndicator: React.FC = () => {
  const status = useEnrichStore(s => s.status);
  const message = useEnrichStore(s => s.statusMessage);

  if (status === 'idle') return null;

  return (
    <div className={`enrich-indicator enrich-indicator--${status}`}>
      {status === 'running' && <LoaderIcon size={12} color="var(--accent-primary)" />}
      {status === 'done' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-success, #6aaa72)" strokeWidth="2.5">
          <path d="M5 12l5 5L19 7" />
        </svg>
      )}
      {status === 'error' && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-danger, #a0555a)" strokeWidth="2.5">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
        </svg>
      )}
      <span className="enrich-indicator-text">{message}</span>
    </div>
  );
};

export default ChatPanel;
