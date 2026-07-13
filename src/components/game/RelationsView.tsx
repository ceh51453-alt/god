import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { CrownIcon, FollowersIcon } from '@/ui/icons';
import './GameViews.css';

export const RelationsView: React.FC = () => {
  const game = useChatStore(s => s.game);
  const { path, character } = game;

  return (
    <div className="gv">
      <div className="gv-header">
        <h3 className="gv-title">
          {path === 'god' ? 'Thần Hệ & Đồng Minh' : 'Quan Hệ & Phe Phái'}
        </h3>
        <p className="gv-desc">
          {path === 'god'
            ? 'Theo dõi mối quan hệ với các vị thần khác, liên minh, và xung đột.'
            : 'Quản lý quan hệ với NPC, phe phái, đồng đội, và kẻ thù.'}
        </p>
      </div>

      <div className="gv-cards">
        {character?.faction && (
          <div className="gv-card">
            <div className="gv-card-icon"><CrownIcon size={20} color={path === 'god' ? '#d4874a' : '#7b8fa8'} /></div>
            <div className="gv-card-info">
              <h4>{path === 'god' ? 'Thần Hệ' : 'Phe Phái'}</h4>
              <p>{character.faction}</p>
            </div>
          </div>
        )}
        {character?.pantheonName && (
          <div className="gv-card">
            <div className="gv-card-icon"><CrownIcon size={20} color="#d4874a" /></div>
            <div className="gv-card-info">
              <h4>Tên Thần Hệ</h4>
              <p>{character.pantheonName}</p>
            </div>
          </div>
        )}
        {character?.followerName && (
          <div className="gv-card">
            <div className="gv-card-icon"><FollowersIcon size={20} color={path === 'god' ? '#d4874a' : '#7b8fa8'} /></div>
            <div className="gv-card-info">
              <h4>{path === 'god' ? 'Thiên Sứ' : 'Đồng Hành'}</h4>
              <p>{character.followerName}</p>
              {character.followerDesc && <span className="gv-card-sub">{character.followerDesc}</span>}
            </div>
          </div>
        )}
      </div>

      <div className="gv-empty-note">
        <FollowersIcon size={40} color="var(--color-ash)" />
        <p>Mối quan hệ sẽ phát triển khi ngươi tương tác với nhân vật trong game.</p>
      </div>
    </div>
  );
};
