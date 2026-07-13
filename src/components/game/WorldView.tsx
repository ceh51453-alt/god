import React from 'react';
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
  const { path, character } = game;

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
      </div>

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
    </div>
  );
};
