import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { DivinePowerIcon, SwordIcon } from '@/ui/icons';
import './GameViews.css';

export const PowersView: React.FC = () => {
  const game = useChatStore(s => s.game);
  const { path, character } = game;

  return (
    <div className="gv">
      <div className="gv-header">
        <h3 className="gv-title">
          {path === 'creator' ? 'Tạo Vật & Sáng Tạo' :
           path === 'god' ? 'Phép Thuật & Quyền Năng' : 'Kỹ Năng & Võ Công'}
        </h3>
        <p className="gv-desc">
          {path === 'creator'
            ? 'Danh mục mọi thứ ngươi đã sáng tạo: sinh vật, quy luật, thần linh, vạn vật.'
            : path === 'god'
            ? 'Quản lý phép thuật, lời nguyền, phúc lành, và quyền năng thần thánh.'
            : 'Theo dõi kỹ năng, võ công, tu luyện, và vật phẩm đặc biệt.'}
        </p>
      </div>

      {/* Trait-based abilities */}
      {character?.traits?.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Bẩm Phú Đặc Biệt</h4>
          <div className="gv-cards">
            {character.traits.map((traitId, i) => (
              <div key={traitId} className="gv-card">
                <div className="gv-card-icon">
                  <DivinePowerIcon size={20} color={path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8'} />
                </div>
                <div className="gv-card-info">
                  <h4>{traitId}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {character?.customTraits && (
        <div className="gv-section">
          <h4 className="gv-section-title">Bẩm Phú Tùy Chỉnh</h4>
          <p className="gv-text">{character.customTraits}</p>
        </div>
      )}

      <div className="gv-empty-note">
        <SwordIcon size={40} color="var(--color-ash)" />
        <p>Quyền năng và kỹ năng sẽ được mở khóa khi ngươi tiến triển trong game.</p>
      </div>
    </div>
  );
};
