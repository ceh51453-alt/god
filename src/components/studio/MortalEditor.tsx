import React, { useState, useCallback } from 'react';
import { useMortalStore } from './mortalStore';
import { useChatStore } from '@/stores/chatStore';
import {
  getMortalCategory,
  mortalEntitySummary,
  type MortalEntity, type MortalCategoryDef, type MortalCategoryId
} from './mortalTypes';
import {
  buildDecree, asStr, asArr, asStats, asSub, asGraph,
  type FieldDef, type FieldValue, type SubItem, type GraphNode,
} from './studioTypes';
import { NodeTree } from './NodeTree';
import { CloseIcon, CopyIcon, SendIcon, CheckIcon } from '@/ui/icons';

interface Props {
  entity: MortalEntity;
  onClose: () => void;
}

export const MortalEditor: React.FC<Props> = ({ entity, onClose }) => {
  const cat = getMortalCategory(entity.category);
  const update = useMortalStore(s => s.update);
  const remove = useMortalStore(s => s.remove);
  const duplicate = useMortalStore(s => s.duplicate);
  const openEditor = useMortalStore(s => s.openEditor);
  const entities = useMortalStore(s => s.entities);

  const [name, setName] = useState(entity.name);
  const [values, setValues] = useState<Record<string, FieldValue>>(() => structuredClone(entity.values));
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setField = useCallback((id: string, v: FieldValue) => {
    setValues(prev => ({ ...prev, [id]: v }));
    setSaved(false);
  }, []);

  const commit = useCallback(() => {
    update(entity.id, { name: name.trim(), values });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  }, [entity.id, name, values, update]);

  const handleClose = useCallback(() => {
    update(entity.id, { name: name.trim(), values });
    onClose();
  }, [entity.id, name, values, update, onClose]);

  const handleDuplicate = useCallback(() => {
    update(entity.id, { name: name.trim(), values });
    const newId = duplicate(entity.id);
    if (newId) openEditor(newId);
  }, [entity.id, name, values, update, duplicate, openEditor]);

  const handleDecree = useCallback(() => {
    const current: MortalEntity = { ...entity, name: name.trim(), values };
    update(entity.id, { name: name.trim(), values });
    // Dùng chung hàm buildDecree nếu nó lấy entity generic
    const text = `<MortalCreate>\n${JSON.stringify({ category: current.category, name: current.name, tagline: current.values.tagline, fields: current.values }, null, 2)}\n</MortalCreate>`;
    useChatStore.getState().setPendingDecree(text);
    useChatStore.getState().setActiveView('chat');
    onClose();
  }, [entity, name, values, update, onClose]);

  return (
    <div className="studio-editor glass-heavy" style={{ '--cat-accent': cat.accent } as React.CSSProperties}>
      <div className="se-head">
        <span className="se-badge" style={{ color: cat.accent, borderColor: `${cat.accent}55` }}>{cat.name}</span>
        <button className="btn btn-icon se-close" onClick={handleClose} aria-label="Đóng">
          <CloseIcon size={18} />
        </button>
      </div>

      <input
        className="se-name-input"
        value={name}
        onChange={e => { setName(e.target.value); setSaved(false); }}
        placeholder={cat.namePlaceholder}
        style={{ borderColor: `${cat.accent}30` }}
      />

      <div className="se-fields">
        {cat.fields.map(f => (
          <FieldRow
            key={f.id}
            field={f}
            value={values[f.id]}
            accent={cat.accent}
            rootLabel={name || cat.name}
            onChange={v => setField(f.id, v)}
          />
        ))}
      </div>

      <div className="se-actions">
        {confirmDelete ? (
          <div className="se-confirm">
            <span>Xóa vĩnh viễn tạo vật này?</span>
            <button className="btn btn-sm btn-danger" onClick={() => { remove(entity.id); onClose(); }}>Xóa</button>
            <button className="btn btn-sm" onClick={() => setConfirmDelete(false)}>Hủy</button>
          </div>
        ) : (
          <>
            <button className="btn btn-sm btn-danger se-del" onClick={() => setConfirmDelete(true)}>Xóa</button>
            <button className="btn btn-sm" onClick={handleDuplicate}>
              <CopyIcon size={14} /> Nhân bản
            </button>
            <div className="se-actions-spacer" />
            <button className="btn btn-sm" onClick={commit}>
              {saved ? <><CheckIcon size={14} color="var(--accent-success)" /> Đã lưu</> : 'Lưu Lại'}
            </button>
            <button
              className="btn btn-sm se-decree"
              onClick={handleDecree}
              style={{ background: `${cat.accent}22`, borderColor: `${cat.accent}55`, color: cat.accent }}
              title="Đưa tạo vật này vào thế giới — AI sẽ tường thuật"
            >
              <SendIcon size={14} color={cat.accent} /> Hiện Thực Hóa
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   FIELD ROW
   ═══════════════════════════════════════════════════════ */

const FieldRow: React.FC<{
  field: FieldDef;
  value: FieldValue | undefined;
  accent: string;
  rootLabel: string;
  onChange: (v: FieldValue) => void;
}> = ({ field: f, value, accent, rootLabel, onChange }) => {
  return (
    <div className={`se-field ${f.full ? 'se-field--full' : ''}`}>
      <label className="se-label">
        {f.label}
        {f.hint && <span className="se-hint"> · {f.hint}</span>}
      </label>

      {f.type === 'text' && (
        <input className="input" value={asStr(value)} placeholder={f.placeholder}
          onChange={e => onChange(e.target.value)} />
      )}

      {f.type === 'textarea' && (
        <textarea className="input" value={asStr(value)} placeholder={f.placeholder} rows={3}
          onChange={e => onChange(e.target.value)} />
      )}

      {f.type === 'select' && (
        <select className="input" value={asStr(value)} onChange={e => onChange(e.target.value)}>
          <option value="">— chọn —</option>
          {f.options?.map(o => (
            <option key={o.value} value={o.value}>{o.value}{o.hint ? ` · ${o.hint}` : ''}</option>
          ))}
        </select>
      )}

      {f.type === 'tags' && (
        <TagsField value={asArr(value)} accent={accent} suggestions={f.suggestions} onChange={onChange} />
      )}

      {f.type === 'stats' && (
        <StatsField field={f} value={asStats(value)} accent={accent} onChange={onChange} />
      )}

      {f.type === 'sublist' && (
        <SublistField field={f} value={asSub(value)} accent={accent} onChange={onChange} />
      )}

      {f.type === 'graph' && (
        <NodeTree
          nodes={asGraph(value)}
          rootLabel={rootLabel}
          accent={accent}
          config={f.graph}
          onChange={(nodes: GraphNode[]) => onChange(nodes)}
        />
      )}

      {f.type === 'relations' && (
        <RelationsField field={f} value={asArr(value)} accent={accent} onChange={onChange} />
      )}
    </div>
  );
};

/* ── Tags ── */
const TagsField: React.FC<{
  value: string[]; accent: string; suggestions?: string[]; onChange: (v: string[]) => void;
}> = ({ value, accent, suggestions, onChange }) => {
  const [draft, setDraft] = useState('');
  const add = (t: string) => {
    const tag = t.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft('');
  };
  const remaining = (suggestions ?? []).filter(s => !value.includes(s));
  return (
    <div className="se-tags">
      <div className="se-chips">
        {value.map(t => (
          <span key={t} className="se-chip" style={{ borderColor: `${accent}55`, background: `${accent}18` }}>
            {t}
            <button onClick={() => onChange(value.filter(x => x !== t))} aria-label="Xóa">×</button>
          </span>
        ))}
        <input
          className="se-chip-input"
          value={draft}
          placeholder="+ thêm..."
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(draft); }
            else if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
          }}
        />
      </div>
      {remaining.length > 0 && (
        <div className="se-suggest">
          {remaining.slice(0, 10).map(s => (
            <button key={s} className="se-suggest-chip" onClick={() => add(s)}>+ {s}</button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ── Stats (sliders) ── */
const StatsField: React.FC<{
  field: FieldDef; value: Record<string, number>; accent: string; onChange: (v: Record<string, number>) => void;
}> = ({ field: f, value, accent, onChange }) => (
  <div className="se-stats">
    {(f.stats ?? []).map(s => {
      const v = value[s.key] ?? s.def;
      const pct = ((v - s.min) / (s.max - s.min)) * 100;
      return (
        <div key={s.key} className="se-stat">
          <div className="se-stat-top">
            <span className="se-stat-name">{s.label}</span>
            <span className="se-stat-val" style={{ color: accent }}>{v}</span>
          </div>
          <input
            className="slider se-slider"
            type="range" min={s.min} max={s.max} value={v}
            style={{ background: `linear-gradient(90deg, ${accent}88 ${pct}%, var(--color-stone) ${pct}%)` }}
            onChange={e => onChange({ ...value, [s.key]: Number(e.target.value) })}
          />
        </div>
      );
    })}
  </div>
);

/* ── Sublist ── */
const SublistField: React.FC<{
  field: FieldDef; value: SubItem[]; accent: string; onChange: (v: SubItem[]) => void;
}> = ({ field: f, value, accent, onChange }) => {
  const cols = f.cols ?? { title: 'Mục' };
  const rows = value || [];
  const setRow = (i: number, patch: Partial<SubItem>) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const addRow = () => onChange([...rows, { title: '', meta: '', detail: '' }]);
  const delRow = (i: number) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="se-sublist">
      {rows.map((r, i) => (
        <div key={i} className="se-subrow">
          <div className="se-subrow-idx" style={{ color: accent, borderColor: `${accent}44` }}>{i + 1}</div>
          <div className="se-subrow-fields">
            <div className="se-subrow-line">
              <input className="input se-sub-title" value={r.title} placeholder={cols.title}
                onChange={e => setRow(i, { title: e.target.value })} />
              {cols.numeric && (
                <input className="input se-sub-num" type="number" value={r.num ?? ''} placeholder={cols.numeric}
                  onChange={e => setRow(i, { num: e.target.value === '' ? undefined : Number(e.target.value) })} />
              )}
              {cols.meta && (
                <input className="input se-sub-meta" value={r.meta} placeholder={cols.meta}
                  onChange={e => setRow(i, { meta: e.target.value })} />
              )}
            </div>
            {cols.detail && (
              <input className="input se-sub-detail" value={r.detail} placeholder={cols.detail}
                onChange={e => setRow(i, { detail: e.target.value })} />
            )}
          </div>
          <button className="se-subrow-del" onClick={() => delRow(i)} aria-label="Xóa hàng">×</button>
        </div>
      ))}
      <button className="se-add-row" onClick={addRow} style={{ color: accent, borderColor: `${accent}44` }}>
        + {cols.addLabel ?? 'Thêm hàng'}
      </button>
    </div>
  );
};

/* ── Relations ── */
const RelationsField: React.FC<{
  field: FieldDef; value: string[]; accent: string; onChange: (v: string[]) => void;
}> = ({ field: f, value, accent, onChange }) => {
  const target = f.relationTo as MortalCategoryId;
  const all = useMortalStore(s => s.entities);
  const options = all.filter(e => e.category === target);
  
  // fallback for safe
  let targetName = 'Thực thể';
  try {
    targetName = getMortalCategory(target).plural;
  } catch (e) {}

  if (options.length === 0) {
    return <p className="se-rel-empty">Chưa có {targetName}. Tạo ở phân hệ tương ứng để liên kết.</p>;
  }
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter(x => x !== id) : [...value, id]);

  return (
    <div className="se-relations">
      {options.map(o => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            className={`se-rel-chip ${on ? 'se-rel-chip--on' : ''}`}
            onClick={() => toggle(o.id)}
            style={on ? { borderColor: `${accent}77`, background: `${accent}22`, color: 'var(--text-primary)' } : undefined}
          >
            {on && <CheckIcon size={12} color={accent} />}
            {o.name || 'Vô Danh'}
          </button>
        );
      })}
    </div>
  );
};
