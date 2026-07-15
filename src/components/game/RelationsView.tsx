import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useShallow } from 'zustand/react/shallow';
import { deriveAffinityStage } from '@/engine/mvu/schema';
import { CrownIcon, FollowersIcon, SwordIcon } from '@/ui/icons';
import './GameViews.css';

/* ── Affinity color mapping ── */
function affinityColor(value: number): string {
  if (value <= -60) return '#a0555a';
  if (value <= -10) return '#c07050';
  if (value <= 10) return 'var(--text-muted)';
  if (value <= 60) return '#6aaa72';
  return '#4a8fa8';
}

export const RelationsView: React.FC = () => {
  const { game, statData } = useChatStore(useShallow(s => ({ game: s.game, statData: s.statData })));
  const { path, character } = game;
  const pathAccent = path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8';

  // NPCs from MVU
  const npcEntries = Object.entries(statData.npcs || {});
  // Entities from MVU (creatures, gods, etc.)
  const entityEntries = Object.entries(statData.entities || {});
  // Quests from MVU
  const questEntries = Object.entries(statData.quests || {});
  // Macro systems
  const diplomacyEntries = Object.entries(statData.diplomacy || {});
  const councilEntries = Object.entries(statData.council || {});

  const activeQuests = questEntries.filter(([, q]) => q.status === 'active' || q.status === 'pending');
  const completedQuests = questEntries.filter(([, q]) => q.status === 'completed' || q.status === 'failed');

  const hasContent = npcEntries.length > 0 || entityEntries.length > 0 ||
                     questEntries.length > 0 || character?.faction || character?.followerName;

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

      {/* Basic info cards */}
      <div className="gv-cards">
        {character?.faction && (
          <div className="gv-card">
            <div className="gv-card-icon"><CrownIcon size={20} color={pathAccent} /></div>
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
            <div className="gv-card-icon"><FollowersIcon size={20} color={pathAccent} /></div>
            <div className="gv-card-info">
              <h4>{path === 'god' ? 'Thiên Sứ' : 'Đồng Hành'}</h4>
              <p>{character.followerName}</p>
              {character.followerDesc && <span className="gv-card-sub">{character.followerDesc}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Diplomacy */}
      {diplomacyEntries.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Ngoại Giao</h4>
          <div className="rv-diplomacy-grid">
            {diplomacyEntries.map(([key, d]) => (
              <div key={key} className="rv-diplomacy-card">
                <div className="rv-dip-header">
                  <span className="rv-dip-target">{key}</span>
                  <span className={`rv-dip-status status-${d.status}`}>{d.status}</span>
                </div>
                <div className="rv-dip-score">
                  <span>War Score:</span>
                  <strong style={{ color: d.warScore > 0 ? '#6aaa72' : d.warScore < 0 ? '#a0555a' : '#c9a84c' }}>
                    {d.warScore > 0 ? '+' : ''}{d.warScore}
                  </strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Council */}
      {councilEntries.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Tiểu Hội Đồng</h4>
          <div className="rv-council-grid">
            {councilEntries.map(([key, c]) => {
              const holder = c.holderId ? (statData.npcs?.[c.holderId]?.name || c.holderId) : 'Khuyết';
              return (
                <div key={key} className="rv-council-card">
                  <span className="rv-council-title">{c.title}</span>
                  <div className="rv-council-holder">
                    <span className="rv-council-name" style={{ color: c.holderId ? 'inherit' : 'var(--text-muted)' }}>
                      {holder}
                    </span>
                    <span className="rv-council-comp" title="Năng Lực">NL: {c.competence}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* NPCs */}
      {npcEntries.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Nhân Vật</h4>
          <div className="rv-npc-grid">
            {npcEntries.map(([key, npc]) => {
              const stage = deriveAffinityStage(npc.affinity);
              const affColor = affinityColor(npc.affinity);
              return (
                <div key={key} className="rv-npc-card">
                  <div className="rv-npc-header">
                    <div className="rv-npc-avatar" style={{ borderColor: affColor }}>
                      {(npc.name || key).charAt(0).toUpperCase()}
                    </div>
                    <div className="rv-npc-identity">
                      <span className="rv-npc-name">{npc.name || key}</span>
                      <div className="rv-npc-titles">
                        {npc.title && <span className="rv-npc-title">{npc.title}</span>}
                        {npc.role && <span className="rv-npc-role">{npc.role}</span>}
                      </div>
                      {npc.relationshipTypes && npc.relationshipTypes.length > 0 && (
                        <div className="rv-npc-reltypes">
                          {npc.relationshipTypes.map(rt => <span key={rt} className="rv-badge">{rt}</span>)}
                        </div>
                      )}
                    </div>
                    {!npc.alive && <span className="rv-npc-dead" title={npc.causeOfDeath}>Đã Mất</span>}
                  </div>

                  {/* Affinity & Trust bars */}
                  <div className="rv-bars-group">
                    <div className="rv-affinity">
                      <div className="rv-affinity-header">
                        <span className="rv-affinity-stage" style={{ color: affColor }}>Hảo Cảm: {stage}</span>
                        <span className="rv-affinity-value" style={{ color: affColor }}>
                          {npc.affinity > 0 ? '+' : ''}{npc.affinity}
                        </span>
                      </div>
                      <div className="rv-affinity-bar">
                        <div className="rv-affinity-center" />
                        <div
                          className="rv-affinity-fill"
                          style={{
                            width: `${Math.abs(npc.affinity) / 2}%`,
                            left: npc.affinity >= 0 ? '50%' : `${50 - Math.abs(npc.affinity) / 2}%`,
                            background: affColor,
                          }}
                        />
                      </div>
                    </div>

                    <div className="rv-affinity">
                      <div className="rv-affinity-header">
                        <span className="rv-affinity-stage" style={{ color: 'var(--text-secondary)' }}>Tin Cậy</span>
                        <span className="rv-affinity-value" style={{ color: 'var(--text-secondary)' }}>
                          {npc.trust > 0 ? '+' : ''}{npc.trust || 0}
                        </span>
                      </div>
                      <div className="rv-affinity-bar">
                        <div className="rv-affinity-center" />
                        <div
                          className="rv-affinity-fill"
                          style={{
                            width: `${Math.abs(npc.trust || 0) / 2}%`,
                            left: (npc.trust || 0) >= 0 ? '50%' : `${50 - Math.abs(npc.trust || 0) / 2}%`,
                            background: 'var(--text-muted)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loyalty (if applicable) */}
                  {npc.loyalty !== undefined && npc.loyalty !== 50 && (
                    <div className="rv-npc-loyalty">
                      <span className="rv-npc-loyalty-label">Trung Thành</span>
                      <span className="rv-npc-loyalty-val" style={{
                        color: npc.loyalty > 50 ? '#6aaa72' : npc.loyalty < 0 ? '#a0555a' : 'var(--text-muted)'
                      }}>
                        {npc.loyalty}
                      </span>
                    </div>
                  )}

                  {/* Personality Axes */}
                  {npc.personalityAxes && (
                    <div className="rv-personality">
                      <div className="rv-pers-row">
                        <span className="rv-pers-label">{npc.personalityAxes.goodEvil >= 0 ? 'Thiện' : 'Ác'}</span>
                        <div className="rv-pers-bar"><div className="rv-pers-fill" style={{ width: `${Math.min(100, Math.abs(npc.personalityAxes.goodEvil))}%`, background: npc.personalityAxes.goodEvil >= 0 ? '#6aaa72' : '#a0555a' }} /></div>
                      </div>
                      <div className="rv-pers-row">
                        <span className="rv-pers-label">{npc.personalityAxes.braveCoward >= 0 ? 'Dũng' : 'Hèn'}</span>
                        <div className="rv-pers-bar"><div className="rv-pers-fill" style={{ width: `${Math.min(100, Math.abs(npc.personalityAxes.braveCoward))}%`, background: npc.personalityAxes.braveCoward >= 0 ? '#4a8fa8' : '#c07050' }} /></div>
                      </div>
                    </div>
                  )}

                  {/* Notes: Memories, Promises, Knowledge */}
                  {(npc.memories?.length > 0 || npc.unkeptPromises?.length > 0 || npc.knows?.length > 0) && (
                    <div className="rv-npc-notes">
                      {npc.knows?.slice(0, 2).map((k, i) => (
                        <span key={`k-${i}`} className="rv-npc-note rv-npc-note--know">Biết: {k}</span>
                      ))}
                      {npc.memories?.slice(0, 2).map((m, i) => (
                        <span key={`m-${i}`} className="rv-npc-note rv-npc-note--memory">{m.event} [{m.emotion}]</span>
                      ))}
                      {npc.unkeptPromises?.slice(0, 2).map((p, i) => (
                        <span key={`p-${i}`} className="rv-npc-note rv-npc-note--promise">Nợ: {p}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Entity Relationships */}
      {entityEntries.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Thực Thể Liên Quan</h4>
          <div className="rv-entity-list">
            {entityEntries.map(([key, entity]) => {
              const statusColor = entity.status === 'active' ? '#6aaa72' :
                                  entity.status === 'dormant' ? '#c9a84c' :
                                  entity.status === 'destroyed' ? '#a0555a' : 'var(--text-muted)';
              return (
                <div key={key} className="rv-entity-row">
                  <div className="rv-entity-dot" style={{ background: statusColor }} />
                  <span className="rv-entity-name">{entity.name || key}</span>
                  <span className="rv-entity-type" style={{ color: pathAccent }}>{entity.type}</span>
                  {entity.loyalty !== 0 && (
                    <span className="rv-entity-loyalty" style={{
                      color: entity.loyalty > 0 ? '#6aaa72' : '#a0555a'
                    }}>
                      {entity.loyalty > 0 ? '+' : ''}{entity.loyalty}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Nhiệm Vụ Đang Thực Hiện</h4>
          <div className="rv-quest-list">
            {activeQuests.map(([key, quest]) => {
              const typeColor = quest.type === 'main' ? '#c9a84c' :
                                quest.type === 'divine' ? '#d4874a' :
                                quest.type === 'side' ? '#7b8fa8' : pathAccent;
              const doneCount = quest.objectives?.filter(o => o.done).length || 0;
              const totalCount = quest.objectives?.length || 0;
              return (
                <div key={key} className="rv-quest-card">
                  <div className="rv-quest-header">
                    <span className="rv-quest-type" style={{ borderColor: `${typeColor}44`, color: typeColor }}>
                      {quest.type === 'main' ? 'Chính' : quest.type === 'divine' ? 'Thần' :
                       quest.type === 'side' ? 'Phụ' : quest.type === 'political' ? 'Chính Trị' : 'Cá Nhân'}
                    </span>
                    <span className="rv-quest-title">{quest.title || key}</span>
                    {quest.status === 'pending' && <span className="rv-quest-pending">Chờ</span>}
                  </div>

                  {/* Objectives */}
                  {totalCount > 0 && (
                    <div className="rv-quest-objectives">
                      {quest.objectives!.map((obj, i) => (
                        <div key={i} className={`rv-quest-obj ${obj.done ? 'rv-quest-obj--done' : ''}`}>
                          <span className="rv-quest-check">{obj.done ? '\u2713' : '\u25CB'}</span>
                          <span>{obj.description}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress + reward */}
                  <div className="rv-quest-footer">
                    {totalCount > 0 && (
                      <span className="rv-quest-progress">{doneCount}/{totalCount}</span>
                    )}
                    {quest.reward && (
                      <span className="rv-quest-reward">Thưởng: {quest.reward}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div className="gv-section">
          <h4 className="gv-section-title">Nhiệm Vụ Đã Hoàn Thành</h4>
          <div className="rv-quest-list rv-quest-list--completed">
            {completedQuests.map(([key, quest]) => (
              <div key={key} className={`rv-quest-completed ${quest.status === 'failed' ? 'rv-quest-completed--failed' : ''}`}>
                <span className="rv-quest-status-icon">
                  {quest.status === 'completed' ? '\u2713' : '\u2717'}
                </span>
                <span className="rv-quest-title-sm">{quest.title || key}</span>
                <span className="rv-quest-result" style={{
                  color: quest.status === 'completed' ? '#6aaa72' : '#a0555a'
                }}>
                  {quest.status === 'completed' ? 'Thành Công' : 'Thất Bại'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasContent && (
        <div className="gv-empty-note">
          <FollowersIcon size={40} color="var(--color-ash)" />
          <p>Mối quan hệ sẽ phát triển khi ngươi tương tác với nhân vật trong game.</p>
        </div>
      )}
    </div>
  );
};
