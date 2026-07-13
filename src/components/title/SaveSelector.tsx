import React, { useState, useEffect } from 'react';
import { listSaves, deleteSlot, type SaveMeta } from '@/stores/saveManager';
import type { GamePath } from '@/components/creation/creationData';
import { DivinePowerIcon } from '@/ui/icons';
import './SaveSelector.css';

interface SaveSelectorProps {
  onLoad: (slotId: string) => void;
  onClose: () => void;
}

const pathLabels: Record<string, string> = {
  creator: 'Sáng Thế Thần',
  god: 'Thần',
  mortal: 'Phàm Nhân',
};

const pathAccents: Record<string, string> = {
  creator: '#c9a84c',
  god: '#d4874a',
  mortal: '#7b8fa8',
};

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Vừa xong';
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return formatDate(ts);
}

export const SaveSelector: React.FC<SaveSelectorProps> = ({ onLoad, onClose }) => {
  const [saves, setSaves] = useState<SaveMeta[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSaves(listSaves());
    requestAnimationFrame(() => setLoaded(true));
  }, []);

  const handleDelete = (slotId: string) => {
    deleteSlot(slotId);
    setSaves(listSaves());
    setDeletingId(null);
  };

  const getPathIcon = (path: GamePath) => {
    const accent = pathAccents[path] || '#c9a84c';
    switch (path) {
      case 'creator':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round">
            <path d="M12 2L14.5 8.5L21 9.5L16 14L17.5 21L12 17.5L6.5 21L8 14L3 9.5L9.5 8.5L12 2Z" />
          </svg>
        );
      case 'god':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        );
      case 'mortal':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M5 20C5 17 8 14 12 14C16 14 19 17 19 20" />
          </svg>
        );
      default:
        return <DivinePowerIcon size={20} color={accent} />;
    }
  };

  return (
    <div className={`save-selector-overlay ${loaded ? 'save-selector-overlay--visible' : ''}`} onClick={onClose}>
      <div className="save-selector-panel glass-heavy" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="save-selector-header">
          <h2 className="save-selector-title">Chọn Lưu Trữ</h2>
          <button className="save-selector-close" onClick={onClose} title="Đóng">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Save list */}
        <div className="save-selector-list">
          {saves.length === 0 ? (
            <div className="save-selector-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M8 12h8M12 8v8" />
              </svg>
              <p>Chưa có lưu trữ nào</p>
              <p className="save-selector-empty-hint">Bắt đầu trò chơi mới để tạo lưu trữ</p>
            </div>
          ) : (
            saves.map((save, i) => {
              const accent = pathAccents[save.path] || '#c9a84c';
              return (
                <div
                  key={save.slotId}
                  className="save-card"
                  style={{
                    '--save-accent': accent,
                    '--save-index': i,
                  } as React.CSSProperties}
                >
                  {/* Delete confirmation overlay */}
                  {deletingId === save.slotId && (
                    <div className="save-card-confirm">
                      <span>Xóa lưu trữ này?</span>
                      <div className="save-card-confirm-actions">
                        <button
                          className="save-card-btn save-card-btn--cancel"
                          onClick={() => setDeletingId(null)}
                        >
                          Hủy
                        </button>
                        <button
                          className="save-card-btn save-card-btn--delete"
                          onClick={() => handleDelete(save.slotId)}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Card content */}
                  <div className="save-card-icon">
                    {getPathIcon(save.path)}
                  </div>

                  <div className="save-card-info">
                    <div className="save-card-name" style={{ color: accent }}>
                      {save.name || 'Không tên'}
                    </div>
                    <div className="save-card-meta">
                      <span className="save-card-path">{pathLabels[save.path] || save.path}</span>
                      <span className="save-card-dot">&middot;</span>
                      <span>Lượt {save.turnCount}</span>
                      <span className="save-card-dot">&middot;</span>
                      <span>{timeAgo(save.updatedAt)}</span>
                    </div>
                  </div>

                  <div className="save-card-actions">
                    <button
                      className="save-card-btn save-card-btn--load"
                      style={{ borderColor: `${accent}40`, color: accent }}
                      onClick={() => onLoad(save.slotId)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Chơi
                    </button>
                    <button
                      className="save-card-btn save-card-btn--trash"
                      onClick={() => setDeletingId(save.slotId)}
                      title="Xóa"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveSelector;
