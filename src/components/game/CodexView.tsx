import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { ScrollIcon } from '@/ui/icons';
import './GameViews.css';

export const CodexView: React.FC = () => {
  const { game, messages } = useChatStore(useShallow(s => ({ game: s.game, messages: s.messages })));
  const { path, character } = game;

  // Count non-system messages as story entries
  const storyMessages = messages.filter(m => m.role !== 'system');

  return (
    <div className="gv">
      <div className="gv-header">
        <h3 className="gv-title">
          {path === 'creator' ? 'Sử Ký Sáng Thế' :
           path === 'god' ? 'Kinh Điển Thần Thánh' : 'Nhật Ký Phiêu Lưu'}
        </h3>
        <p className="gv-desc">
          {path === 'creator'
            ? 'Biên niên sử ghi lại mọi sáng tạo và sự kiện trong vũ trụ của ngươi.'
            : path === 'god'
            ? 'Ghi chép thần thoại, sự kiện, và lịch sử thần giới.'
            : 'Nhật ký ghi lại hành trình, cuộc gặp gỡ, và sự kiện quan trọng.'}
        </p>
      </div>

      {/* Backstory */}
      {character?.backstory && (
        <div className="gv-section">
          <h4 className="gv-section-title">Bối Cảnh</h4>
          <p className="gv-text">{character.backstory}</p>
        </div>
      )}

      {/* Appearance */}
      {character?.appearance && (
        <div className="gv-section">
          <h4 className="gv-section-title">Ngoại Hình</h4>
          <p className="gv-text">{character.appearance}</p>
        </div>
      )}

      {/* Story progress */}
      <div className="gv-section">
        <h4 className="gv-section-title">Tiến Trình Câu Chuyện</h4>
        <div className="gv-stats-row">
          <div className="gv-stat">
            <span className="gv-stat-number">{storyMessages.length}</span>
            <span className="gv-stat-label">Lượt tương tác</span>
          </div>
          <div className="gv-stat">
            <span className="gv-stat-number">{game.turnCount}</span>
            <span className="gv-stat-label">
              {path === 'creator' ? 'Chu kỳ' : path === 'god' ? 'Kỷ nguyên' : 'Ngày'}
            </span>
          </div>
        </div>
      </div>

      {storyMessages.length === 0 && (
        <div className="gv-empty-note">
          <ScrollIcon size={40} color="var(--color-ash)" />
          <p>Câu chuyện chưa bắt đầu. Hãy mở tab {path === 'creator' ? '"Sáng Tạo"' : path === 'god' ? '"Phàm Giới"' : '"Hành Trình"'} và bắt đầu phiêu lưu.</p>
        </div>
      )}

      {/* Recent story snippets */}
      {storyMessages.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Sự Kiện Gần Đây</h4>
          <div className="gv-timeline">
            {storyMessages.slice(-6).map(m => (
              <div key={m.id} className={`gv-timeline-item gv-timeline-item--${m.role}`}>
                <div className="gv-timeline-dot" />
                <div className="gv-timeline-content">
                  <span className="gv-timeline-role">
                    {m.role === 'user' ? (godName(game) || 'Bạn') : 'Vận Mệnh'}
                  </span>
                  <p className="gv-timeline-text">{m.content.slice(0, 200)}{m.content.length > 200 ? '...' : ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function godName(game: { godName: string }): string {
  return game.godName || '';
}
