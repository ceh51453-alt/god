import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useStudioStore } from '@/components/studio/studioStore';
import { useShallow } from 'zustand/react/shallow';
import {
  getCategory, asStr, asArr,
  type StudioEntity,
} from '@/components/studio/studioTypes';
import { DivinePowerIcon, SwordIcon, LightningIcon } from '@/ui/icons';
import {
  CREATOR_TRAITS, GOD_TRAITS, MORTAL_TRAITS,
} from '@/components/creation/creationData';
import './GameViews.css';

export const PowersView: React.FC = () => {
  const { game, statData } = useChatStore(useShallow(s => ({ game: s.game, statData: s.statData })));
  const { path, character } = game;
  const pathAccent = path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8';

  // Studio entities relevant to this view
  const allEntities = useStudioStore(s => s.entities);
  const creatorEntities = allEntities.filter(e =>
    ['species', 'artifact', 'power', 'material', 'deity'].includes(e.category)
  );

  // Live abilities from statData
  const abilities = statData.abilities || {};
  const abilityEntries = Object.entries(abilities);

  // Live entities from statData (artifacts, creatures, etc.)
  const gameEntities = statData.entities || {};
  const entityEntries = Object.entries(gameEntities);

  // Traits
  const traitDefs = path === 'creator' ? CREATOR_TRAITS : path === 'god' ? GOD_TRAITS : MORTAL_TRAITS;
  const liveTraits = statData.traits.length ? statData.traits : (character?.traits ?? []);

  const hasContent = liveTraits.length > 0 || abilityEntries.length > 0 ||
                     entityEntries.length > 0 || creatorEntities.length > 0;

  return (
    <div className="gv">
      <div className="gv-header">
        <h3 className="gv-title">
          {path === 'creator' ? 'Tạo Vật & Sáng Tạo' :
           path === 'god' ? 'Phép Thuật & Quyền Năng' : 'Kỹ Năng & Võ Công'}
        </h3>
        <p className="gv-desc">
          {path === 'creator'
            ? 'Danh mục mọi thứ ngươi đã sáng tạo: sinh vật, vật liệu, tạo vật, hệ sức mạnh.'
            : path === 'god'
            ? 'Quản lý phép thuật, lời nguyền, phúc lành, và quyền năng thần thánh.'
            : 'Theo dõi kỹ năng, võ công, tu luyện, và vật phẩm đặc biệt.'}
        </p>
      </div>

      {/* Abilities (from MVU statData) */}
      {abilityEntries.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">
            {path === 'creator' ? 'Quyền Năng Sáng Thế' :
             path === 'god' ? 'Thần Thuật' : 'Kỹ Năng'}
          </h4>
          <div className="pv-abilities">
            {abilityEntries.map(([key, ability]) => (
              <div key={key} className="pv-ability-card">
                <div className="pv-ability-header">
                  <LightningIcon size={14} color={pathAccent} />
                  <span className="pv-ability-name">{key}</span>
                  <span className="pv-ability-level" style={{ color: pathAccent }}>
                    Lv.{ability.level}
                  </span>
                </div>
                {ability.description && (
                  <p className="pv-ability-desc">{ability.description}</p>
                )}
                <div className="pv-ability-bar">
                  <div
                    className="pv-ability-bar-fill"
                    style={{ width: `${ability.level}%`, background: pathAccent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Game Entities (creatures, artifacts from MVU) */}
      {entityEntries.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">
            {path === 'creator' ? 'Thực Thể Đang Hoạt Động' :
             path === 'god' ? 'Tạo Vật & Thần Khí' : 'Pháp Bảo & Đồng Minh'}
          </h4>
          <div className="pv-entities">
            {entityEntries.map(([key, entity]) => {
              const statusColor = entity.status === 'active' ? '#6aaa72' :
                                  entity.status === 'dormant' ? '#c9a84c' :
                                  entity.status === 'destroyed' ? '#a0555a' : 'var(--text-muted)';
              return (
                <div key={key} className="pv-entity-card">
                  <div className="pv-entity-header">
                    <span className="pv-entity-name">{entity.name || key}</span>
                    <span className="pv-entity-type" style={{ borderColor: `${pathAccent}40`, color: pathAccent }}>
                      {entity.type}
                    </span>
                  </div>
                  {entity.description && <p className="pv-entity-desc">{entity.description}</p>}
                  <div className="pv-entity-footer">
                    <span className="pv-entity-power">
                      <SwordIcon size={10} color={pathAccent} /> {entity.power}
                    </span>
                    <span className="pv-entity-status" style={{ color: statusColor }}>
                      {entity.status === 'active' ? 'Hoạt Động' :
                       entity.status === 'dormant' ? 'Ngủ Đông' :
                       entity.status === 'destroyed' ? 'Đã Hủy' : 'Không Rõ'}
                    </span>
                    {entity.loyalty !== 0 && (
                      <span className="pv-entity-loyalty" style={{ color: entity.loyalty > 0 ? '#6aaa72' : '#a0555a' }}>
                        Trung Thành: {entity.loyalty > 0 ? '+' : ''}{entity.loyalty}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Studio Entities (Creator path — things from Xưởng Sáng Thế) */}
      {path === 'creator' && creatorEntities.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Xưởng Sáng Thế</h4>
          <div className="pv-studio-grid">
            {creatorEntities.map(e => {
              const cat = getCategory(e.category);
              const tagline = asStr(e.values.tagline);
              return (
                <div key={e.id} className="pv-studio-card" style={{ '--cat-accent': cat.accent } as React.CSSProperties}>
                  <div className="pv-studio-stripe" style={{ background: cat.accent }} />
                  <div className="pv-studio-body">
                    <div className="pv-studio-top">
                      <span className="pv-studio-name">{e.name || 'Chưa đặt tên'}</span>
                      <span className="pv-studio-cat" style={{ color: cat.accent }}>{cat.name}</span>
                    </div>
                    {tagline && <p className="pv-studio-tagline">{tagline}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Traits */}
      {liveTraits.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Bẩm Phú Đặc Biệt</h4>
          <div className="gv-cards">
            {liveTraits.map(tid => {
              const def = traitDefs.find(t => t.id === tid);
              return (
                <div key={tid} className="gv-card">
                  <div className="gv-card-icon">
                    <DivinePowerIcon size={20} color={pathAccent} />
                  </div>
                  <div className="gv-card-info">
                    <h4>{def?.name ?? tid}</h4>
                    {def?.effects && <span className="gv-card-sub">{def.effects}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {character?.customTraits && (
        <div className="gv-section">
          <h4 className="gv-section-title">Bẩm Phú Tùy Chỉnh</h4>
          <p className="gv-text">{character.customTraits}</p>
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="gv-empty-note">
          <SwordIcon size={40} color="var(--color-ash)" />
          <p>Quyền năng và kỹ năng sẽ được mở khóa khi ngươi tiến triển trong game.</p>
        </div>
      )}
    </div>
  );
};
