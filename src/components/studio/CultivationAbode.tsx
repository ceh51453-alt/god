import React from 'react';
import { useMortalStore } from './mortalStore';
import {
  MORTAL_CATEGORIES, getMortalCategory, blankMortalEntity, mortalEntitySummary,
  type MortalCategoryId, type MortalCategoryDef, type MortalEntity,
} from './mortalTypes';
import { asStr, asArr } from './studioTypes';
import { MortalEditor } from './MortalEditor';
import {
  MapIcon, ScrollIcon, SwordIcon, FollowersIcon,
} from '@/ui/icons';
import './CreationStudio.css';

/* ── Glyph icons ── */
interface GlyphProps { size?: number; color?: string }
const GLYPHS: Record<string, React.FC<GlyphProps>> = {
  world: MapIcon, law: ScrollIcon, artifact: SwordIcon, users: FollowersIcon
};

/* ── Badges hiển thị trên thẻ ── */
function cardBadges(e: MortalEntity): string[] {
  const out: string[] = [];
  const push = (id: string) => { const v = asStr(e.values[id]); if (v) out.push(v); };
  switch (e.category) {
    case 'realm': push('level'); break;
    case 'technique': push('type'); push('mastery'); break;
    case 'artifact': push('type'); push('rarity'); break;
    case 'encounter': break;
  }
  return out.slice(0, 2);
}

export const CultivationAbode: React.FC = () => {
  const entities = useMortalStore(s => s.entities);
  const activeCategory = useMortalStore(s => s.activeCategory);
  const editingId = useMortalStore(s => s.editingId);
  const setActiveCategory = useMortalStore(s => s.setActiveCategory);
  const openEditor = useMortalStore(s => s.openEditor);
  const add = useMortalStore(s => s.add);
  const getById = useMortalStore(s => s.getById);

  const cat = getMortalCategory(activeCategory);
  const items = entities.filter(e => e.category === activeCategory);
  const editing = editingId ? getById(editingId) : undefined;

  const createBlank = (c: MortalCategoryDef) => {
    const e = blankMortalEntity(c);
    add(e);
    openEditor(e.id);
  };

  const total = entities.length;

  return (
    <div className="studio" style={{ '--cat-accent': cat.accent } as React.CSSProperties}>
      {/* Header */}
      <div className="studio-header studio-header--row">
        <div>
          <h3 className="studio-title">Động Phủ / Hành Trang</h3>
          <p className="studio-sub">
            Nơi cất giữ pháp bảo, tu luyện công pháp và ghi nhận những kỳ ngộ giang hồ.
            {total > 0 && <span className="studio-count"> · Tổng: {total}</span>}
          </p>
        </div>
      </div>

      {/* Category rail */}
      <div className="studio-rail">
        {MORTAL_CATEGORIES.map(c => {
          const Glyph = GLYPHS[c.glyph] || MapIcon;
          const on = c.id === activeCategory;
          const n = entities.reduce((a, e) => a + (e.category === c.id ? 1 : 0), 0);
          return (
            <button
              key={c.id}
              className={`studio-tab ${on ? 'studio-tab--on' : ''}`}
              onClick={() => setActiveCategory(c.id as MortalCategoryId)}
              style={on ? { borderColor: `${c.accent}66`, background: `${c.accent}18` } : undefined}
            >
              <Glyph size={18} color={on ? c.accent : 'var(--text-muted)'} />
              <span className="studio-tab-name" style={on ? { color: c.accent } : undefined}>{c.name}</span>
              {n > 0 && <span className="studio-tab-count">{n}</span>}
            </button>
          );
        })}
      </div>

      {/* Active category intro + toolbar */}
      <div className="studio-cat-intro">
        <p className="studio-cat-tagline">{cat.tagline}</p>
        <div className="studio-toolbar">
          <button
            className="studio-new"
            onClick={() => createBlank(cat)}
            style={{ borderColor: `${cat.accent}55`, color: cat.accent, background: `${cat.accent}14` }}
          >
            + Ghi Nhận {cat.name}
          </button>
        </div>
      </div>

      {/* Entity grid */}
      {items.length === 0 ? (
        <div className="studio-empty">
          {React.createElement(GLYPHS[cat.glyph] || MapIcon, { size: 44, color: 'var(--color-ash)' })}
          <p>Chưa có {cat.plural.toLowerCase()}.</p>
        </div>
      ) : (
        <div className="studio-grid">
          {items.map(e => {
            const badges = cardBadges(e);
            return (
              <button key={e.id} className="studio-card" onClick={() => openEditor(e.id)}
                style={{ '--card-accent': cat.accent } as React.CSSProperties}>
                <div className="studio-card-stripe" style={{ background: cat.accent }} />
                <div className="studio-card-body">
                  <div className="studio-card-top">
                    <h4 className="studio-card-name">{e.name || `${cat.name} chưa đặt tên`}</h4>
                    {React.createElement(GLYPHS[cat.glyph] || MapIcon, { size: 16, color: cat.accent })}
                  </div>
                  <p className="studio-card-sum">{mortalEntitySummary(e)}</p>
                  {(badges.length > 0) && (
                    <div className="studio-card-meta">
                      {badges.map(b => (
                        <span key={b} className="studio-card-badge"
                          style={{ borderColor: `${cat.accent}44`, color: cat.accent }}>{b}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => openEditor(null)}>
          <div className="modal-content studio-modal" onClick={ev => ev.stopPropagation()}>
            <MortalEditor key={editing.id} entity={editing} onClose={() => openEditor(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CultivationAbode;
