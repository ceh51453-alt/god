import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { MapIcon } from '@/ui/icons';
import './GameViews.css';

export const WorldView: React.FC = () => {
  const game = useChatStore(s => s.game);
  const { path, character } = game;

  return (
    <div className="gv">
      <div className="gv-header">
        <h3 className="gv-title">
          {path === 'creator' ? 'Vũ Trụ Của Ngươi' :
           path === 'god' ? 'Đền Thờ & Lãnh Thổ' : 'Bản Đồ Thế Giới'}
        </h3>
        <p className="gv-desc">
          {path === 'creator'
            ? 'Vũ trụ đang chờ được định hình. Hãy sáng tạo qua Chronicle để mở rộng thế giới.'
            : path === 'god'
            ? 'Quản lý đền thờ, lãnh thổ tín ngưỡng, và điểm sức mạnh thần thánh.'
            : 'Khám phá thế giới, đánh dấu địa điểm quan trọng trên hành trình.'}
        </p>
      </div>

      <div className="gv-cards">
        {character?.region && (
          <div className="gv-card">
            <div className="gv-card-icon"><MapIcon size={24} color="var(--accent-primary)" /></div>
            <div className="gv-card-info">
              <h4>Vị Trí Hiện Tại</h4>
              <p>{character.region}</p>
            </div>
          </div>
        )}
        {character?.era && (
          <div className="gv-card">
            <div className="gv-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <div className="gv-card-info">
              <h4>Kỷ Nguyên</h4>
              <p>{character.era}</p>
              {character.eraDescription && <span className="gv-card-sub">{character.eraDescription}</span>}
            </div>
          </div>
        )}
        {path === 'creator' && character?.cosmicDomain && (
          <div className="gv-card">
            <div className="gv-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" strokeDasharray="3 3" /></svg>
            </div>
            <div className="gv-card-info">
              <h4>Miền Khởi Nguyên</h4>
              <p>{character.cosmicDomain}</p>
            </div>
          </div>
        )}
        {path === 'creator' && character?.cosmicRules && (
          <div className="gv-card gv-card--wide">
            <div className="gv-card-info">
              <h4>Quy Luật Vũ Trụ</h4>
              <p className="gv-card-text">{character.cosmicRules}</p>
            </div>
          </div>
        )}
      </div>

      <div className="gv-empty-note">
        <MapIcon size={40} color="var(--color-ash)" />
        <p>Hãy chơi qua tab {path === 'creator' ? '"Sáng Tạo"' : path === 'god' ? '"Phàm Giới"' : '"Hành Trình"'} để mở khóa thêm nội dung.</p>
      </div>
    </div>
  );
};
