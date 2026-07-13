import React, { useState } from 'react';
import { useStudioStore } from './studioStore';
import { GenesisWeb } from './GenesisWeb';
import {
  CATEGORIES, getCategory, blankEntity, entityFromPreset, entitySummary,
  asStr, asArr,
  type CategoryId, type CategoryDef, type StudioEntity,
} from './studioTypes';
import { StudioEditor } from './StudioEditor';
import {
  MapIcon, ScrollIcon, SwordIcon, LightningIcon, PrayerIcon,
} from '@/ui/icons';
import './CreationStudio.css';

/* ── Glyph icons ── */
interface GlyphProps { size?: number; color?: string }
const GemIcon: React.FC<GlyphProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round">
    <path d="M6 3H18L22 9L12 21L2 9L6 3Z" />
    <path d="M2 9H22" /><path d="M9 3L7.5 9L12 21" /><path d="M15 3L16.5 9L12 21" />
  </svg>
);
const DnaIcon: React.FC<GlyphProps> = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round">
    <path d="M7 3C7 8 17 10 17 15C17 18 15 20 12 21" />
    <path d="M17 3C17 8 7 10 7 15C7 18 9 20 12 21" />
    <path d="M8 5H16" /><path d="M8.5 8H15.5" /><path d="M8.5 16H15.5" /><path d="M8 19H16" />
  </svg>
);

const GLYPHS: Record<string, React.FC<GlyphProps>> = {
  world: MapIcon, law: ScrollIcon, material: GemIcon,
  power: LightningIcon, species: DnaIcon, artifact: SwordIcon, faith: PrayerIcon,
};

/* ── Badges hiển thị trên thẻ ── */
function cardBadges(e: StudioEntity): string[] {
  const out: string[] = [];
  const push = (id: string) => { const v = asStr(e.values[id]); if (v) out.push(v); };
  switch (e.category) {
    case 'world': push('type'); push('scale'); break;
    case 'law': push('domain'); push('scope'); break;
    case 'material': push('class'); push('rarity'); break;
    case 'power': push('paradigm'); break;
    case 'species': push('kingdom'); push('basis'); break;
    case 'artifact': push('type'); push('rarity'); break;
    case 'faith': push('type'); push('morality'); break;
  }
  return out.slice(0, 2);
}

export const CreationStudio: React.FC = () => {
  const entities = useStudioStore(s => s.entities);
  const activeCategory = useStudioStore(s => s.activeCategory);
  const editingId = useStudioStore(s => s.editingId);
  const setActiveCategory = useStudioStore(s => s.setActiveCategory);
  const openEditor = useStudioStore(s => s.openEditor);
  const add = useStudioStore(s => s.add);
  const getById = useStudioStore(s => s.getById);

  const [viewMode, setViewMode] = useState<'list' | 'web'>('list');
  const cat = getCategory(activeCategory);
  const items = entities.filter(e => e.category === activeCategory);
  const editing = editingId ? getById(editingId) : undefined;

  const createBlank = (c: CategoryDef) => {
    const e = blankEntity(c);
    add(e);
    openEditor(e.id);
  };
  const createFromPreset = (c: CategoryDef, presetName: string) => {
    const preset = c.presets.find(p => p.name === presetName);
    if (!preset) return;
    const e = entityFromPreset(c, preset);
    add(e);
    openEditor(e.id);
  };

  const total = entities.length;

  return (
    <div className="studio" style={{ '--cat-accent': cat.accent } as React.CSSProperties}>
      {/* Header */}
      <div className="studio-header studio-header--row">
        <div>
          <h3 className="studio-title">Xưởng Sáng Thế</h3>
          <p className="studio-sub">
            Định hình mọi tầng bậc tồn tại — từ quy luật vũ trụ tới tế bào sự sống.
            {total > 0 && <span className="studio-count"> · Đã sáng tạo {total} thực thể</span>}
          </p>
        </div>
        <div className="studio-viewtoggle">
          <button className={viewMode === 'list' ? 'on' : ''} onClick={() => setViewMode('list')}>Danh Sách</button>
          <button className={viewMode === 'web' ? 'on' : ''} onClick={() => setViewMode('web')}>Sơ Đồ</button>
        </div>
      </div>

      {viewMode === 'web' ? (
        <GenesisWeb />
      ) : (
        <>

      {/* Category rail */}
      <div className="studio-rail">
        {CATEGORIES.map(c => {
          const Glyph = GLYPHS[c.glyph];
          const on = c.id === activeCategory;
          const n = entities.reduce((a, e) => a + (e.category === c.id ? 1 : 0), 0);
          return (
            <button
              key={c.id}
              className={`studio-tab ${on ? 'studio-tab--on' : ''}`}
              onClick={() => setActiveCategory(c.id as CategoryId)}
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
            + Sáng Tạo {cat.name}
          </button>
          {cat.presets.length > 0 && (
            <div className="studio-presets">
              <span className="studio-presets-label">Từ mẫu:</span>
              {cat.presets.map(p => (
                <button key={p.name} className="studio-preset-chip" onClick={() => createFromPreset(cat, p.name)}>
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Entity grid */}
      {items.length === 0 ? (
        <div className="studio-empty">
          {React.createElement(GLYPHS[cat.glyph], { size: 44, color: 'var(--color-ash)' })}
          <p>Chưa có {cat.plural.toLowerCase()}. Bấm “Sáng Tạo {cat.name}” hoặc chọn một mẫu để khởi đầu.</p>
        </div>
      ) : (
        <div className="studio-grid">
          {items.map(e => {
            const badges = cardBadges(e);
            const tags = asArr(e.values.properties ?? e.values.traits ?? e.values.practices ?? e.values.enchant);
            return (
              <button key={e.id} className="studio-card" onClick={() => openEditor(e.id)}
                style={{ '--card-accent': cat.accent } as React.CSSProperties}>
                <div className="studio-card-stripe" style={{ background: cat.accent }} />
                <div className="studio-card-body">
                  <div className="studio-card-top">
                    <h4 className="studio-card-name">{e.name || `${cat.name} chưa đặt tên`}</h4>
                    {React.createElement(GLYPHS[cat.glyph], { size: 16, color: cat.accent })}
                  </div>
                  <p className="studio-card-sum">{entitySummary(e)}</p>
                  {(badges.length > 0 || tags.length > 0) && (
                    <div className="studio-card-meta">
                      {badges.map(b => (
                        <span key={b} className="studio-card-badge"
                          style={{ borderColor: `${cat.accent}44`, color: cat.accent }}>{b}</span>
                      ))}
                      {tags.slice(0, 3).map(t => (
                        <span key={t} className="studio-card-tag">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

        </>
      )}

      {/* Editor modal */}
      {editing && (
        <div className="modal-overlay" onClick={() => openEditor(null)}>
          <div className="modal-content studio-modal" onClick={ev => ev.stopPropagation()}>
            <StudioEditor key={editing.id} entity={editing} onClose={() => openEditor(null)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CreationStudio;
