import React from 'react';
import { useChatStore } from '@/stores/chatStore';
import { useShallow } from 'zustand/react/shallow';
import {
  CREATOR_ATTRIBUTES, GOD_ATTRIBUTES, MORTAL_ATTRIBUTES,
  CREATOR_TRAITS, GOD_TRAITS, MORTAL_TRAITS,
  type AttributeDef, type TraitDef,
} from '@/components/creation/creationData';
import { deriveTier, deriveMeters, progressionLabel } from '@/engine/mechanics/pathMechanics';
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
  const tier = deriveTier(path, res.progress);
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
        <h5 className="sp-section-title">{progressionLabel(path)}</h5>
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

      {/* Crisis (live) */}
      {w.crisis && (
        <div className="sp-section">
          <h5 className="sp-section-title">Khủng Hoảng</h5>
          <p className="sp-crisis">{w.crisis}</p>
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
