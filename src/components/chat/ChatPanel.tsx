import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { sendChat } from '@/engine/api/apiClient';
import { useConnectionStore } from '@/stores/connectionStore';
import { getOpeningPrompt } from '@/engine/rag/ragEngine';
import { buildPrompt, estimatePromptTokens } from '@/engine/prompt/promptBuilder';
import { parseNarrativeTags } from '@/engine/narrative/tagParser';
import { extractStudioCreations } from '@/engine/studio/studioSync';
import { useStudioStore } from '@/components/studio/studioStore';
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
    messages, isStreaming, streamingText, retryingAttempt, retryingMax,
    addMessage, setStreaming, appendStreamText, setRetrying,
    updateLastAssistantMessage, game, setGame,
    statData, processAIResponse, initStatData,
    pendingDecree, setPendingDecree,
  } = useChatStore(useShallow(s => ({
    messages: s.messages,
    isStreaming: s.isStreaming,
    streamingText: s.streamingText,
    retryingAttempt: s.retryingAttempt,
    retryingMax: s.retryingMax,
    addMessage: s.addMessage,
    setStreaming: s.setStreaming,
    appendStreamText: s.appendStreamText,
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
        onDone: (full) => {
          // ── Auto-ghi tạo vật vào Xưởng Sáng Thế (chỉ Sáng Thế Thần) ──
          const { text: stripped, creations } = extractStudioCreations(full);
          if (path === 'creator' && creations.length > 0) {
            for (const c of creations) {
              const studio = useStudioStore.getState();
              const dup = studio.entities.some(
                e => e.category === c.category &&
                  e.name.trim().toLowerCase() === c.name.trim().toLowerCase()
              );
              if (!dup) studio.add(c);
            }
          }

          // ── Process AI response through MVU extractor ──
          const { cleanText, patches } = processAIResponse(stripped);

          // If no patches were extracted, just update the message normally
          if (patches.length === 0) {
            updateLastAssistantMessage(cleanText || stripped);
            setGame({ turnCount: game.turnCount + 1 });
          }

          setStreaming(false);
          setRetrying(null);
          scrollToBottom();
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
  }, [path, game, addMessage, setStreaming, appendStreamText,
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
    setStreaming(false);
    setRetrying(null);
    if (streamingText) {
      updateLastAssistantMessage(streamingText + '\n\n[Gián đoạn]');
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

  return (
    <div className="chat-panel" style={{ '--chat-accent': pathAccent } as React.CSSProperties}>
      {/* Messages */}
      <div className="chat-messages">
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

        {displayMessages.map((msg) => {
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
                  <div
                    className="chat-msg-text"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(streamingText || '') }}
                  />
                ) : segments ? (
                  <NarrativeSegments segments={segments} />
                ) : (
                  <div
                    className="chat-msg-text"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
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

export default ChatPanel;
