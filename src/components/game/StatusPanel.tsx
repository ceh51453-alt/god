import React, { useCallback, useMemo } from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useStudioStore } from '@/components/studio/studioStore';
import { useShallow } from 'zustand/react/shallow';
import {
  CREATOR_ATTRIBUTES, GOD_ATTRIBUTES, MORTAL_ATTRIBUTES,
  CREATOR_TRAITS, GOD_TRAITS, MORTAL_TRAITS,
  type AttributeDef, type TraitDef,
} from '@/components/creation/creationData';
import { deriveTier, deriveMeters, progressionLabel } from '@/engine/mechanics/pathMechanics';
import { getProgressionOverride } from '@/engine/canon/progression';
import type { GamePath } from '@/components/creation/creationData';
import './GameViews.css';

interface Props {
  fullPage?: boolean;
}

export const StatusPanel: React.FC<Props> = ({ fullPage }) => {
  const { game, statData } = useChatStore(useShallow(s => ({ game: s.game, statData: s.statData })));
  const path: GamePath = (game.path ?? statData.path) as GamePath;
  const { character, godName } = game;

  const attrDefs: AttributeDef[] = path === 'creator' ? CREATOR_ATTRIBUTES :
    path === 'god' ? GOD_ATTRIBUTES : MORTAL_ATTRIBUTES;
  const traitDefs: TraitDef[] = path === 'creator' ? CREATOR_TRAITS :
    path === 'god' ? GOD_TRAITS : MORTAL_TRAITS;

  const pathAccent = path === 'creator' ? '#c9a84c' : path === 'god' ? '#d4874a' : '#7b8fa8';

  // ── Live data (statData) with character fallback ──
  const liveAttrs: Record<string, number> = Object.keys(statData.attributes).length
    ? statData.attributes
    : Object.fromEntries(attrDefs.map(a => [a.key, character?.attributes?.[a.key] ?? a.default]));
  const attrName = (k: string) => attrDefs.find(a => a.key === k)?.name ?? k;

  const res = statData.resources;
  const studioEntities = useStudioStore(s => s.entities);
  const ladder = useMemo(() => getProgressionOverride(path, studioEntities), [path, studioEntities]);
  const tier = deriveTier(path, res.progress, ladder?.tiers);
  const meters = deriveMeters(statData);
  const w = statData.world;

  const liveTraits = statData.traits.length ? statData.traits : (character?.traits ?? []);

  // ── Resource rows ──
  const resourceRows: { label: string; value: string }[] = [];
  resourceRows.push({ label: 'Quyền Năng', value: res.power.toLocaleString() });
  if (path === 'god' || res.followers > 0) resourceRows.push({ label: 'Tín Đồ', value: res.followers.toLocaleString() });
  if (path === 'god' || res.faith > 0) resourceRows.push({ label: 'Tín Ngưỡng', value: `${res.faith}/100` });
  if (path === 'mortal' || res.wealth > 0) resourceRows.push({ label: 'Tài Sản', value: res.wealth.toLocaleString() });
  if (res.karma !== 0) resourceRows.push({ label: 'Nghiệp', value: `${res.karma > 0 ? '+' : ''}${res.karma}` });

  return (
    <div className={`sp ${fullPage ? 'sp--full' : 'sp--sidebar'}`}>
      {/* Header */}
      <div className="sp-header">
        <h4 className="sp-title" style={{ color: pathAccent }}>
          {path === 'creator' ? 'Bản Thể Sáng Tạo' :
           path === 'god' ? 'Hồ Sơ Thần Thánh' : 'Hồ Sơ Nhân Vật'}
        </h4>
        {(godName || statData.name) && <p className="sp-name">{godName || statData.name}</p>}
        {(statData.title || character?.title) && <p className="sp-subtitle">{statData.title || character?.title}</p>}
      </div>

      {/* Progression */}
      <div className="sp-section">
        <h5 className="sp-section-title">{progressionLabel(path, ladder?.label)}</h5>
        <div className="sp-prog">
          <div className="sp-prog-top">
            <span className="sp-prog-tier" style={{ color: pathAccent }}>{tier.name}</span>
            <span className="sp-prog-num">
              {tier.next != null ? `${res.progress} / ${tier.next}` : `${res.progress} · Tối cao`}
            </span>
          </div>
          <div className="sp-prog-bar">
            <div className="sp-prog-bar-fill" style={{ width: `${tier.pct}%`, background: pathAccent }} />
          </div>
          <span className="sp-prog-desc">
            {tier.desc}{tier.nextName ? ` → kế: ${tier.nextName}` : ''}
          </span>
        </div>
      </div>

      {/* Resources */}
      <div className="sp-section">
        <h5 className="sp-section-title">Tài Nguyên</h5>
        <div className="sp-res">
          {resourceRows.map(r => (
            <div key={r.label} className="sp-res-item">
              <span className="sp-res-val" style={{ color: pathAccent }}>{r.value}</span>
              <span className="sp-res-label">{r.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Resource Mechanics — Full page only */}
      {fullPage && <ResourceMechanics path={path} resources={res} pathAccent={pathAccent} />}

      {/* Derived meters */}
      {meters.length > 0 && (
        <div className="sp-section">
          <h5 className="sp-section-title">Chỉ Số Phái Sinh</h5>
          <div className="sp-meters">
            {meters.map(m => (
              <div key={m.key} className="sp-meter" title={m.hint}>
                <span className="sp-meter-val" style={{ color: m.value < 0 ? '#a0555a' : pathAccent }}>
                  {m.value > 0 ? '+' : ''}{m.value}
                </span>
                <span className="sp-meter-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Info (live world) */}
      <div className="sp-info-grid">
        {w.divineRealm && <InfoItem label="Miền Quyền Năng" value={w.divineRealm} />}
        {w.cosmicDomain && <InfoItem label="Miền Sáng Tạo" value={w.cosmicDomain} />}
        {w.mortalClass && <InfoItem label="Giai Cấp" value={w.mortalClass} />}
        {w.era && <InfoItem label="Kỷ Nguyên" value={w.era} />}
        {w.region && <InfoItem label="Khu Vực" value={w.region} />}
        {w.faction && <InfoItem label={path === 'god' ? 'Thần Hệ' : 'Phe Phái'} value={w.faction} />}
        {w.reputation && <InfoItem label="Danh Tiếng" value={w.reputation} />}
      </div>

      {/* Attributes (live) */}
      <div className="sp-section">
        <h5 className="sp-section-title">Thuộc Tính</h5>
        <div className="sp-attrs">
          {Object.entries(liveAttrs).map(([key, val]) => {
            const pct = ((val + 100) / 200) * 100;
            const barColor = val >= 0 ? pathAccent : '#a0555a';
            return (
              <div key={key} className="sp-attr">
                <div className="sp-attr-header">
                  <span className="sp-attr-name">{attrName(key)}</span>
                  <span className="sp-attr-val" style={{ color: barColor }}>{val}</span>
                </div>
                <div className="sp-attr-bar">
                  <div className="sp-attr-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  <div className="sp-attr-bar-center" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traits (live) */}
      {liveTraits.length > 0 && (
        <div className="sp-section">
          <h5 className="sp-section-title">Bẩm Phú</h5>
          <div className="sp-traits">
            {liveTraits.map(tid => {
              const def = traitDefs.find(t => t.id === tid);
              return (
                <div key={tid} className="sp-trait" style={{ borderColor: `${pathAccent}30` }}>
                  <span className="sp-trait-name" style={{ color: pathAccent }}>{def?.name ?? tid}</span>
                  {def?.effects && <span className="sp-trait-effect">{def.effects}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}



      {/* Companion (live) */}
      {statData.companion.name && (
        <div className="sp-section">
          <h5 className="sp-section-title">{path === 'god' ? 'Thiên Sứ' : 'Đồng Hành'}</h5>
          <p className="sp-companion-name">{statData.companion.name}</p>
          {statData.companion.description && <p className="sp-companion-desc">{statData.companion.description}</p>}
        </div>
      )}
    </div>
  );
};

const InfoItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="sp-info-item">
    <span className="sp-info-label">{label}</span>
    <span className="sp-info-value">{value}</span>
  </div>
);

/* ═══════════════════════════════════════════════════════
   RESOURCE MECHANICS — Chi phí & cơ chế tài nguyên
   ═══════════════════════════════════════════════════════ */

interface ResourceMechanicsProps {
  path: GamePath;
  resources: { power: number; followers: number; faith: number; wealth: number; karma: number; progress: number };
  pathAccent: string;
}

const CREATOR_COSTS = [
  { action: 'Tinh chỉnh nhỏ', cost: '10 — 30', icon: '~' },
  { action: 'Tạo loài / sinh mệnh', cost: '50 — 150', icon: '+' },
  { action: 'Tạo thế giới / quy luật', cost: '200 — 500', icon: '++' },
  { action: 'Tạo vũ trụ / vị thần', cost: '600 — 1500', icon: '+++' },
];

const GOD_COSTS = [
  { action: 'Phép nhỏ / ban phúc', cost: '20 — 50', icon: '~' },
  { action: 'Kỳ tích / phép lạ', cost: '80 — 200', icon: '+' },
  { action: 'Can thiệp thần giới', cost: '150 — 400', icon: '++' },
  { action: 'Đại chiến / thiên phạt', cost: '300 — 800', icon: '+++' },
];

const MORTAL_COSTS = [
  { action: 'Tu luyện / rèn luyện', cost: '5 — 20', icon: '~' },
  { action: 'Thi triển pháp thuật', cost: '20 — 80', icon: '+' },
  { action: 'Đột phá cảnh giới', cost: '50 — 200', icon: '++' },
  { action: 'Triệu hồi / đại pháp', cost: '150 — 500', icon: '+++' },
];

const QUICK_ACTIONS: Record<GamePath, { label: string; prompt: string }[]> = {
  creator: [
    { label: 'Hấp Thu Năng Lượng', prompt: 'Ta tĩnh tâm, hấp thu năng lượng từ hư vô để hồi phục quyền năng.' },
    { label: 'Quan Sát Vũ Trụ', prompt: 'Ta dùng thần nhãn quan sát toàn bộ vũ trụ, tìm kiếm điều bất thường.' },
  ],
  god: [
    { label: 'Hiển Linh', prompt: 'Ta hiện thân trước tín đồ, ban phúc lành và gia tăng tín ngưỡng.' },
    { label: 'Thu Nạp Tín Ngưỡng', prompt: 'Ta mở đền thờ, thu nạp tín ngưỡng từ phàm nhân để tăng thần lực.' },
  ],
  mortal: [
    { label: 'Thiền Định Tu Luyện', prompt: 'Ta tĩnh tọa tu luyện, vận chuyển nội lực, cố gắng tích lũy linh khí.' },
    { label: 'Rèn Luyện Thân Thể', prompt: 'Ta rèn luyện gân cốt, luyện võ tập kiếm để tăng cường thể phách.' },
  ],
};

const ResourceMechanics: React.FC<ResourceMechanicsProps> = ({ path, resources, pathAccent }) => {
  const setPendingDecree = useChatStore(s => s.setPendingDecree);
  const setActiveView = useChatStore(s => s.setActiveView);

  const costs = path === 'creator' ? CREATOR_COSTS : path === 'god' ? GOD_COSTS : MORTAL_COSTS;
  const actions = QUICK_ACTIONS[path] || [];

  const handleQuickAction = useCallback((prompt: string) => {
    // Đẩy qua pendingDecree + chuyển về chat — ChatPanel mount sẽ nhận lệnh
    // và gọi AI (addMessage trần chỉ thêm text, KHÔNG có phản hồi).
    setPendingDecree(prompt);
    setActiveView('chat');
  }, [setPendingDecree, setActiveView]);

  return (
    <>
      {/* Cost Reference */}
      <div className="sp-section">
        <h5 className="sp-section-title">Chi Phí Quyền Năng</h5>
        <div className="rm-cost-table">
          {costs.map(c => (
            <div key={c.action} className="rm-cost-row">
              <span className="rm-cost-icon" style={{ color: pathAccent }}>{c.icon}</span>
              <span className="rm-cost-action">{c.action}</span>
              <span className="rm-cost-value">{c.cost}</span>
            </div>
          ))}
        </div>
        <span className="rm-hint">
          Hiện tại: <strong style={{ color: pathAccent }}>{resources.power.toLocaleString()}</strong> quyền năng
        </span>
      </div>

      {/* Power Flow */}
      <div className="sp-section">
        <h5 className="sp-section-title">Dòng Chảy Năng Lượng</h5>
        <div className="rm-flow">
          <div className="rm-flow-item">
            <div className="rm-flow-bar">
              <div
                className="rm-flow-fill"
                style={{
                  width: `${Math.min(100, (resources.power / 1000) * 100)}%`,
                  background: pathAccent,
                }}
              />
            </div>
            <span className="rm-flow-label">Quyền Năng ({resources.power})</span>
          </div>
          {(path === 'god' || resources.faith > 0) && (
            <div className="rm-flow-item">
              <div className="rm-flow-bar">
                <div
                  className="rm-flow-fill"
                  style={{
                    width: `${resources.faith}%`,
                    background: resources.faith < 20 ? '#a0555a' : pathAccent,
                  }}
                />
              </div>
              <span className="rm-flow-label">
                Tín Ngưỡng ({resources.faith}/100)
                {resources.faith < 20 && <span className="rm-warning"> — Suy Giảm!</span>}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Karma Impact */}
      {resources.karma !== 0 && (
        <div className="sp-section">
          <h5 className="sp-section-title">Nghiệp Lực</h5>
          <div className="rm-karma">
            <div className="rm-karma-bar">
              <div className="rm-karma-center" />
              <div
                className="rm-karma-fill"
                style={{
                  width: `${Math.abs(resources.karma) / 2}%`,
                  left: resources.karma >= 0 ? '50%' : `${50 - Math.abs(resources.karma) / 2}%`,
                  background: resources.karma >= 0 ? '#6aaa72' : '#a0555a',
                }}
              />
            </div>
            <div className="rm-karma-labels">
              <span style={{ color: '#a0555a' }}>Ác</span>
              <span style={{ color: 'var(--text-muted)' }}>{resources.karma > 0 ? '+' : ''}{resources.karma}</span>
              <span style={{ color: '#6aaa72' }}>Thiện</span>
            </div>
            <span className="rm-hint">
              {resources.karma > 30 ? 'Thiện nghiệp mạnh — NPC có xu hướng tin tưởng, kẻ ác tránh xa.' :
               resources.karma < -30 ? 'Ác nghiệp nặng — NPC e sợ, bóng tối dễ theo.' :
               'Nghiệp trung hòa — chưa ảnh hưởng rõ rệt.'}
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {actions.length > 0 && (
        <div className="sp-section">
          <h5 className="sp-section-title">Hành Động Nhanh</h5>
          <div className="rm-actions">
            {actions.map(a => (
              <button
                key={a.label}
                className="rm-action-btn"
                onClick={() => handleQuickAction(a.prompt)}
                style={{ borderColor: `${pathAccent}30`, color: pathAccent }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
