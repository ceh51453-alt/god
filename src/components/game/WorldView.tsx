import React, { useState } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useStudioStore } from '@/components/studio/studioStore';
import { useShallow } from 'zustand/react/shallow';
import {
  getCategory, entitySummary, asStr,
  type StudioEntity, type CategoryId,
} from '@/components/studio/studioTypes';
import { MapIcon, ScrollIcon, LightningIcon, CrownIcon } from '@/ui/icons';
import './GameViews.css';

/* ── Compact icons ── */
const WorldIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><ellipse cx="12" cy="12" rx="5" ry="10" />
  </svg>
);
const LawIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 3v18M5 8l7-5 7 5M5 16l7 5 7-5" />
  </svg>
);
const FaithIcon: React.FC<{ size?: number; color?: string }> = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <path d="M12 2v7M12 22v-7M2 12h7M22 12h-7M4.93 4.93l4.24 4.24M14.83 14.83l4.24 4.24M4.93 19.07l4.24-4.24M14.83 9.17l4.24-4.24" />
  </svg>
);

/* ── Category entity card ── */
const EntityCard: React.FC<{ entity: StudioEntity; accent: string }> = ({ entity, accent }) => {
  const tagline = asStr(entity.values.tagline);
  return (
    <div className="wv-entity-card" style={{ '--entity-accent': accent } as React.CSSProperties}>
      <div className="wv-entity-stripe" style={{ background: accent }} />
      <div className="wv-entity-body">
        <h5 className="wv-entity-name">{entity.name || 'Chưa đặt tên'}</h5>
        {tagline && <p className="wv-entity-tagline">{tagline}</p>}
        <div className="wv-entity-badges">
          {getBadges(entity).map(b => (
            <span key={b} className="wv-entity-badge" style={{ borderColor: `${accent}44`, color: accent }}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

function getBadges(e: StudioEntity): string[] {
  const out: string[] = [];
  const push = (id: string) => { const v = asStr(e.values[id]); if (v) out.push(v); };
  switch (e.category) {
    case 'world': push('type'); push('scale'); break;
    case 'law': push('domain'); push('scope'); break;
    case 'faith': push('type'); push('morality'); break;
    case 'deity': push('rank'); push('moral'); break;
    case 'power': push('paradigm'); break;
    case 'species': push('kingdom'); break;
    case 'material': push('class'); push('rarity'); break;
    case 'artifact': push('type'); push('rarity'); break;
  }
  return out.slice(0, 3);
}

/* ── Stat card ── */
const StatCard: React.FC<{ label: string; value: string | number; accent?: string }> = ({ label, value, accent }) => (
  <div className="wv-stat-card">
    <span className="wv-stat-value" style={accent ? { color: accent } : undefined}>{value}</span>
    <span className="wv-stat-label">{label}</span>
  </div>
);

/* ── Category section ── */
const CategorySection: React.FC<{
  title: string;
  icon: React.ReactNode;
  entities: StudioEntity[];
  categoryId: CategoryId;
  emptyText: string;
}> = ({ title, icon, entities, categoryId, emptyText }) => {
  const cat = getCategory(categoryId);
  if (entities.length === 0) return null;

  return (
    <div className="wv-section">
      <div className="wv-section-header">
        {icon}
        <h4 className="wv-section-title">{title}</h4>
        <span className="wv-section-count">{entities.length}</span>
      </div>
      <div className="wv-entity-grid">
        {entities.map(e => (
          <EntityCard key={e.id} entity={e} accent={cat.accent} />
        ))}
      </div>
    </div>
  );
};

export const WorldView: React.FC = () => {
  const game = useChatStore(s => s.game);
  const statData = useChatStore(s => s.statData);
  const addMessage = useChatStore(s => s.addMessage);
  const { path, character } = game;
  const [buildDomainId, setBuildDomainId] = useState<string | null>(null);
  const [issueEdictDomainId, setIssueEdictDomainId] = useState<string | null>(null);
  const [edictInput, setEdictInput] = useState('');

  // Get studio entities by category
  const allEntities = useStudioStore(s => s.entities);
  const worlds = allEntities.filter(e => e.category === 'world');
  const laws = allEntities.filter(e => e.category === 'law');
  const faiths = allEntities.filter(e => e.category === 'faith');
  const powers = allEntities.filter(e => e.category === 'power');
  const species = allEntities.filter(e => e.category === 'species');
  const materials = allEntities.filter(e => e.category === 'material');
  const artifacts = allEntities.filter(e => e.category === 'artifact');
  const deities = allEntities.filter(e => e.category === 'deity');

  const totalEntities = allEntities.length;
  const timeline = statData.timeline || [];
  
  const activeEvents = statData.world.activeEvents || [];
  const domains = Object.entries(statData.domains || {});
  const armies = Object.entries(statData.armies || {});

  const pathAccent = path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8';

  return (
    <div className="gv wv-root">
      <div className="gv-header">
        <h3 className="gv-title">
          {path === 'creator' ? 'Vũ Trụ Của Ngươi' :
           path === 'god' ? 'Đền Thờ & Lãnh Thổ' : 'Bản Đồ Thế Giới'}
        </h3>
        <p className="gv-desc">
          {path === 'creator'
            ? 'Toàn cảnh vũ trụ — mọi thế giới, quy luật, và tín ngưỡng ngươi đã kiến tạo.'
            : path === 'god'
            ? 'Quản lý đền thờ, lãnh thổ tín ngưỡng, và điểm sức mạnh thần thánh.'
            : 'Khám phá thế giới, đánh dấu địa điểm quan trọng trên hành trình.'}
        </p>
      </div>

      {/* Quick info cards */}
      <div className="wv-quick-row">
        {character?.cosmicDomain && (
          <div className="gv-card">
            <div className="gv-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pathAccent} strokeWidth="1.5">
                <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" strokeDasharray="3 3" />
              </svg>
            </div>
            <div className="gv-card-info">
              <h4>Miền Khởi Nguyên</h4>
              <p>{character.cosmicDomain}</p>
            </div>
          </div>
        )}
        {character?.region && (
          <div className="gv-card">
            <div className="gv-card-icon"><MapIcon size={24} color={pathAccent} /></div>
            <div className="gv-card-info">
              <h4>Vị Trí Hiện Tại</h4>
              <p>{character.region}</p>
            </div>
          </div>
        )}
        {character?.era && (
          <div className="gv-card">
            <div className="gv-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={pathAccent} strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
            </div>
            <div className="gv-card-info">
              <h4>Kỷ Nguyên</h4>
              <p>{character.era}</p>
              {character.eraDescription && <span className="gv-card-sub">{character.eraDescription}</span>}
            </div>
          </div>
        )}
        {statData.world.calendar && (
          <div className="gv-card">
            <div className="gv-card-icon"><ScrollIcon size={24} color={pathAccent} /></div>
            <div className="gv-card-info">
              <h4>Lịch Trình</h4>
              <p>Ngày {statData.world.calendar.day}/{statData.world.calendar.month}/{statData.world.calendar.year}</p>
            </div>
          </div>
        )}
      </div>

      {/* World Events */}
      {activeEvents.length > 0 && (
        <div className="wv-section">
          <div className="wv-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0555a" strokeWidth="1.5" strokeLinecap="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <h4 className="wv-section-title" style={{ color: '#a0555a' }}>Sự Kiện Thế Giới</h4>
          </div>
          <div className="wv-events-grid">
            {activeEvents.map((ev, i) => (
              <div key={i} className="wv-event-card">
                <div className="wv-event-header">
                  <span className="wv-event-name">{ev.name}</span>
                  <span className={`wv-event-status status-${ev.status}`}>{ev.status}</span>
                </div>
                <div className="wv-event-urgency">
                  <div className="wv-urgency-bar">
                    <div className="wv-urgency-fill" style={{ width: `${ev.urgency}%`, background: ev.urgency > 70 ? '#a0555a' : ev.urgency > 40 ? '#c9a84c' : '#6aaa72' }} />
                  </div>
                  <span className="wv-urgency-label">{ev.urgency}%</span>
                </div>
                {ev.impact && <p className="wv-event-impact">{ev.impact}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Domains */}
      {domains.length > 0 && (
        <div className="wv-section">
          <div className="wv-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4a8fa8" strokeWidth="1.5" strokeLinecap="round">
              <path d="M3 21h18M5 21V5a2 2 0 012-2h10a2 2 0 012 2v16M9 21v-4a2 2 0 012-2h2a2 2 0 012 2v4" />
            </svg>
            <h4 className="wv-section-title">Lãnh Địa & Căn Cứ</h4>
            <span className="wv-section-count">{domains.length}</span>
          </div>
          <div className="wv-domains-grid">
            {domains.map(([id, d]) => {
              const bEntries = Object.entries(d.buildings || {});
              return (
                <div key={id} className="wv-domain-card">
                  <div className="wv-domain-header">
                    <div className="wv-domain-identity">
                      <span className="wv-domain-name">{d.name || id}</span>
                      <span className="wv-domain-type">{d.type} - {d.size}</span>
                    </div>
                    <button className="wv-build-btn" onClick={() => setBuildDomainId(id)}>
                      Xây dựng
                    </button>
                  </div>
                  <p className="wv-domain-desc">{d.description}</p>
                  
                  <div className="wv-domain-stats-grid">
                    <div className="wv-domain-stat"><span>Phồn Vinh</span><strong style={{ color: '#c9a84c' }}>{d.prosperity}</strong></div>
                    <div className="wv-domain-stat"><span>An Ninh</span><strong style={{ color: '#4a8fa8' }}>{d.security}</strong></div>
                    <div className="wv-domain-stat"><span>Dân Số</span><strong>{d.population}</strong></div>
                    <div className="wv-domain-stat"><span>Lòng Dân</span><strong style={{ color: d.loyalty < 30 ? '#a0555a' : d.loyalty < 50 ? '#c9a84c' : d.loyalty < 70 ? 'inherit' : d.loyalty < 90 ? '#6aaa72' : '#d4874a' }}>{d.loyalty}% ({d.loyalty < 30 ? 'Hỗn loạn' : d.loyalty < 50 ? 'Bất ổn' : d.loyalty < 70 ? 'Bình yên' : d.loyalty < 90 ? 'Phát triển' : 'Thái bình'})</strong></div>
                  </div>

                  <div className="wv-domain-resources">
                    <span className="wv-res-badge" title="Vàng">🟡 {d.resources?.gold || 0}</span>
                    <span className="wv-res-badge" title="Lương Thực">🌾 {d.resources?.food || 0}</span>
                    <span className="wv-res-badge" title="Gỗ">🪵 {d.resources?.wood || 0}</span>
                    <span className="wv-res-badge" title="Đá">🪨 {d.resources?.stone || 0}</span>
                  </div>

                  {bEntries.length > 0 && (
                    <div className="wv-domain-buildings">
                      {bEntries.map(([bId, b]) => (
                        <div key={bId} className="wv-building-item">
                          <div className="wv-building-info">
                            <span className="wv-building-name">{b.name} <small>Lv.{b.level}</small></span>
                          </div>
                          {b.isConstructing && (
                            <div className="wv-building-progress-wrapper" title={`Còn ${b.turnsLeft} turn`}>
                              <div className="wv-building-progress-bar" style={{ width: `${Math.max(10, 100 - (b.turnsLeft * 10))}%` }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="wv-domain-edicts-header" style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="wv-edicts-title" style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pháp lệnh</span>
                    <button className="wv-build-btn" onClick={() => setIssueEdictDomainId(id)}>Ban hành</button>
                  </div>
                  {Object.keys(d.edicts || {}).length > 0 && (
                    <div className="wv-domain-edicts" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {Object.entries(d.edicts || {}).map(([eId, e]) => (
                        <div key={eId} className="wv-edict-item" style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', padding: '4px 8px', borderRadius: 4 }}>
                          <span className="wv-edict-name" style={{ fontSize: 11, color: 'var(--text-primary)' }}>{e.title}</span>
                          <span className={`wv-edict-status status-${e.status}`} style={{ fontSize: 9, textTransform: 'uppercase', color: e.status === 'active' ? '#6aaa72' : 'var(--text-muted)' }}>{e.status === 'active' ? 'Thực thi' : e.status === 'suspended' ? 'Tạm hoãn' : 'Bãi bỏ'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Armies */}
      {armies.length > 0 && (
        <div className="wv-section">
          <div className="wv-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0555a" strokeWidth="1.5" strokeLinecap="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
            </svg>
            <h4 className="wv-section-title">Lực Lượng Vũ Trang</h4>
            <span className="wv-section-count">{armies.length}</span>
          </div>
          <div className="wv-armies-list">
            {armies.map(([id, a]) => (
              <div key={id} className="wv-army-row">
                <div className="wv-army-main">
                  <span className="wv-army-name">{a.name || id}</span>
                  <span className="wv-army-type">{a.type}</span>
                </div>
                <div className="wv-army-details">
                  <span className="wv-army-stat">Quân số: <strong>{a.size.toLocaleString()}</strong></span>
                  <span className="wv-army-stat">Sĩ khí: <strong style={{ color: a.morale > 70 ? '#6aaa72' : a.morale < 30 ? '#a0555a' : '#c9a84c' }}>{a.morale}</strong></span>
                  <span className="wv-army-stat">Kỷ luật: <strong>{a.discipline || 50}</strong></span>
                  <span className="wv-army-stat">Trang bị: <strong>Lv.{a.equipmentLevel || 1}</strong></span>
                </div>
                <div className="wv-army-status">
                  <span className={`wv-army-badge status-${a.status}`}>{a.status}</span>
                  {a.location && <span className="wv-army-loc">Tại: {a.location}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Universe Statistics */}
      {totalEntities > 0 && (
        <div className="wv-section">
          <div className="wv-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pathAccent} strokeWidth="1.5" strokeLinecap="round">
              <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /><path d="M12 7v5l3 3" />
            </svg>
            <h4 className="wv-section-title">Thống Kê Vũ Trụ</h4>
          </div>
          <div className="wv-stats-grid">
            {worlds.length > 0 && <StatCard label="Thế Giới" value={worlds.length} accent="#4a8fa8" />}
            {laws.length > 0 && <StatCard label="Quy Luật" value={laws.length} accent="#7b9ec7" />}
            {species.length > 0 && <StatCard label="Chủng Loài" value={species.length} accent="#6aaa72" />}
            {powers.length > 0 && <StatCard label="Hệ Sức Mạnh" value={powers.length} accent="#9b6bbf" />}
            {materials.length > 0 && <StatCard label="Vật Liệu" value={materials.length} accent="#a8844a" />}
            {artifacts.length > 0 && <StatCard label="Tạo Vật" value={artifacts.length} accent="#c9a84c" />}
            {faiths.length > 0 && <StatCard label="Tín Ngưỡng" value={faiths.length} accent="#d47a3a" />}
            {deities.length > 0 && <StatCard label="Thần Linh" value={deities.length} accent="#e0a644" />}
            <StatCard label="Tổng" value={totalEntities} accent={pathAccent} />
          </div>
        </div>
      )}

      {/* Worlds */}
      <CategorySection
        title="Các Thế Giới"
        icon={<WorldIcon size={16} color="#4a8fa8" />}
        entities={worlds}
        categoryId="world"
        emptyText="Chưa có thế giới nào"
      />

      {/* Laws */}
      <CategorySection
        title="Quy Luật Nền Tảng"
        icon={<LawIcon size={16} color="#7b9ec7" />}
        entities={laws}
        categoryId="law"
        emptyText="Chưa có quy luật"
      />

      {/* Powers */}
      <CategorySection
        title="Hệ Thống Sức Mạnh"
        icon={<LightningIcon size={16} color="#9b6bbf" />}
        entities={powers}
        categoryId="power"
        emptyText="Chưa có hệ sức mạnh"
      />

      {/* Faith */}
      <CategorySection
        title="Tín Ngưỡng"
        icon={<FaithIcon size={16} color="#d47a3a" />}
        entities={faiths}
        categoryId="faith"
        emptyText="Chưa có tín ngưỡng"
      />

      {/* Deities */}
      <CategorySection
        title="Thần Điện"
        icon={<CrownIcon size={16} color="#e0a644" />}
        entities={deities}
        categoryId="deity"
        emptyText="Chưa có thần linh"
      />

      {/* Species */}
      <CategorySection
        title="Chủng Loài"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6aaa72" strokeWidth="1.5" strokeLinecap="round">
          <path d="M7 3C7 8 17 10 17 15C17 18 15 20 12 21" />
          <path d="M17 3C17 8 7 10 7 15C7 18 9 20 12 21" />
        </svg>}
        entities={species}
        categoryId="species"
        emptyText="Chưa có chủng loài"
      />

      {/* Cosmic Rules (from statData) */}
      {character?.cosmicRules && (
        <div className="wv-section">
          <div className="wv-section-header">
            <ScrollIcon size={16} color={pathAccent} />
            <h4 className="wv-section-title">Quy Luật Vũ Trụ (Khởi Tạo)</h4>
          </div>
          <div className="wv-cosmic-rules">
            <p>{character.cosmicRules}</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline.length > 0 && (
        <div className="wv-section">
          <div className="wv-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={pathAccent} strokeWidth="1.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <h4 className="wv-section-title">Dòng Thời Gian</h4>
          </div>
          <div className="wv-timeline">
            {timeline.slice(-8).reverse().map((entry, i) => (
              <div key={i} className="wv-timeline-item">
                <div className="wv-timeline-dot" style={{ background: pathAccent }} />
                <div className="wv-timeline-content">
                  <span className="wv-timeline-turn">Lượt {entry.turn}</span>
                  <p className="wv-timeline-event">{entry.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {totalEntities === 0 && !character?.cosmicRules && timeline.length === 0 && (
        <div className="gv-empty-note">
          <MapIcon size={40} color="var(--color-ash)" />
          <p>Hãy chơi qua tab {path === 'creator' ? '"Sáng Tạo"' : path === 'god' ? '"Phàm Giới"' : '"Hành Trình"'} để mở khóa thêm nội dung.</p>
        </div>
      )}

      {/* Construction Modal */}
      {buildDomainId && (
        <div className="wv-modal-overlay" onClick={() => setBuildDomainId(null)}>
          <div className="wv-modal" onClick={e => e.stopPropagation()}>
            <div className="wv-modal-header">
              <h4>Xây dựng tại {statData.domains[buildDomainId]?.name || buildDomainId}</h4>
              <button className="wv-modal-close" onClick={() => setBuildDomainId(null)}>×</button>
            </div>
            <div className="wv-modal-body">
              <p>Chọn công trình muốn xây dựng hoặc nâng cấp. Lệnh sẽ được gửi tới AI để xử lý trừ tài nguyên và cập nhật thế giới.</p>
              <div className="wv-build-options">
                {['Lâu Đài', 'Nông Trại', 'Chợ', 'Doanh Trại', 'Tường Thành', 'Bến Cảng', 'Học Viện'].map(b => (
                  <button key={b} className="wv-build-option" onClick={() => {
                    addMessage({ role: 'user', content: `/action Xây dựng ${b} tại ${statData.domains[buildDomainId]?.name || buildDomainId}` });
                    setBuildDomainId(null);
                  }}>
                    Xây {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edict Modal */}
      {issueEdictDomainId && (
        <div className="wv-modal-overlay" onClick={() => setIssueEdictDomainId(null)}>
          <div className="wv-modal" onClick={e => e.stopPropagation()}>
            <div className="wv-modal-header">
              <h4>Ban hành Pháp lệnh tại {statData.domains[issueEdictDomainId]?.name || issueEdictDomainId}</h4>
              <button className="wv-modal-close" onClick={() => setIssueEdictDomainId(null)}>×</button>
            </div>
            <div className="wv-modal-body">
              <p>Mô tả nội dung pháp lệnh bạn muốn ban hành. Quan chấp hành (AI) sẽ đánh giá và thi hành nếu hợp lý.</p>
              <textarea 
                className="wv-edict-input" 
                placeholder="VD: Giảm thuế nông nghiệp 20% trong tháng này để hỗ trợ nạn đói..."
                value={edictInput}
                onChange={e => setEdictInput(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', color: 'var(--text-primary)', borderRadius: '4px', marginBottom: '12px', resize: 'none' }}
              />
              <button 
                className="wv-submit-btn" 
                style={{ width: '100%', padding: '8px', background: '#c9a84c', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => {
                  if (!edictInput.trim()) return;
                  addMessage({ role: 'user', content: `/action Ban hành pháp lệnh tại ${statData.domains[issueEdictDomainId]?.name || issueEdictDomainId}: ${edictInput}` });
                  setIssueEdictDomainId(null);
                  setEdictInput('');
                }}
              >
                Ban Hành
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
