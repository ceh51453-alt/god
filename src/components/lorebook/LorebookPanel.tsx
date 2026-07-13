import React, { useRef, useState } from 'react';
import {
  useLorebookStore, parseLorebookImport, LOGIC,
  type LoreEntry,
} from '@/stores/lorebookStore';
import { CloseIcon } from '@/ui/icons';
import './LorebookPanel.css';

const POSITIONS = [
  ['0', 'Trước Char'], ['1', 'Sau Char'], ['2', 'Đầu A/N'], ['3', 'Cuối A/N'], ['4', '@Depth'],
] as const;
const ROLES = [['0', '⚙️ System'], ['1', '👤 User'], ['2', '🤖 Assistant']] as const;
const LOGICS = [
  [String(LOGIC.AND_ANY), 'AND ANY'], [String(LOGIC.AND_ALL), 'AND ALL'],
  [String(LOGIC.NOT_ANY), 'NOT ANY'], [String(LOGIC.NOT_ALL), 'NOT ALL'],
] as const;

export const LorebookPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const {
    entries, settings, status, statusMessage,
    addEntry, updateEntry, removeEntry, importEntries, clearAll, setSettings,
  } = useLorebookStore();
  const [editing, setEditing] = useState<number | null>(null);
  const [filter, setFilter] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const doImport = (file: File, mode: 'replace' | 'merge') => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const list = parseLorebookImport(data);
        if (list.length === 0) { alert('Không tìm thấy entry hợp lệ trong file.'); return; }
        importEntries(list, mode);
      } catch {
        alert('File JSON không hợp lệ.');
      }
    };
    reader.readAsText(file);
  };

  const filtered = filter.trim()
    ? entries.filter(e => (e.comment + ' ' + e.key.join(' ')).toLowerCase().includes(filter.toLowerCase()))
    : entries;

  const constCount = entries.filter(e => e.constant && !e.disable).length;

  return (
    <div className="conn-panel glass-heavy animate-fadeIn lb-panel">
      <div className="conn-header">
        <div className="conn-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5C4 18.1 5.1 17 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
          </svg>
          <h3>Sổ Tri Thức (Lorebook)</h3>
        </div>
        {onClose && <button className="btn btn-icon" onClick={onClose} aria-label="Đóng"><CloseIcon size={16} /></button>}
      </div>

      <div className="conn-body">
        {/* Settings */}
        <div className="lb-settings">
          <label className="lb-check">
            <input type="checkbox" checked={settings.enabled} onChange={e => setSettings({ enabled: e.target.checked })} />
            Bật chèn World Info
          </label>
          <label className="lb-check">
            <input type="checkbox" checked={settings.autoUpdate} onChange={e => setSettings({ autoUpdate: e.target.checked })} />
            AI tự tạo/bổ sung/xóa cuối mỗi lượt
          </label>
          <label className="lb-check">
            <input type="checkbox" checked={settings.recursion} onChange={e => setSettings({ recursion: e.target.checked })} />
            Đệ quy (recursion)
          </label>
          <div className="lb-num-row">
            <label>Quét sâu <input className="input lb-num" type="number" min={1} max={50} value={settings.scanDepth}
              onChange={e => setSettings({ scanDepth: Number(e.target.value) })} /></label>
            <label>Ngân sách <input className="input lb-num" type="number" min={500} step={500} value={settings.budgetChars}
              onChange={e => setSettings({ budgetChars: Number(e.target.value) })} /></label>
            <label>Đệ quy tối đa <input className="input lb-num" type="number" min={0} max={5} value={settings.maxRecursion}
              onChange={e => setSettings({ maxRecursion: Number(e.target.value) })} /></label>
          </div>
          {status !== 'idle' && (
            <div className={`lb-status lb-status--${status}`}>{statusMessage}</div>
          )}
        </div>

        {/* Toolbar */}
        <div className="lb-toolbar">
          <button className="btn btn-sm btn-primary" onClick={() => { const uid = addEntry(); setEditing(uid); }}>+ Thêm Entry</button>
          <button className="btn btn-sm" onClick={() => fileRef.current?.click()}>Nhập JSON</button>
          {entries.length > 0 && (
            <button className="btn btn-sm btn-danger" onClick={() => { if (confirm('Xóa toàn bộ Sổ Tri Thức?')) clearAll(); }}>Xóa tất cả</button>
          )}
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }}
            onChange={e => {
              const f = e.target.files?.[0];
              if (f) {
                const mode = entries.length > 0 && confirm('OK = Gộp thêm · Cancel = Thay thế toàn bộ') ? 'merge' : 'replace';
                doImport(f, mode);
              }
              e.target.value = '';
            }} />
        </div>

        <div className="lb-summary">
          {entries.length} entry · {constCount} đèn xanh (constant)
          {entries.length > 6 && (
            <input className="input lb-filter" placeholder="Lọc..." value={filter} onChange={e => setFilter(e.target.value)} />
          )}
        </div>

        {/* Entry list */}
        <div className="lb-list">
          {filtered.length === 0 && <p className="lb-empty">Chưa có entry. Bấm “+ Thêm Entry” hoặc “Nhập JSON”.</p>}
          {filtered.map(e => (
            <EntryRow
              key={e.uid}
              entry={e}
              open={editing === e.uid}
              onToggle={() => setEditing(editing === e.uid ? null : e.uid)}
              onChange={patch => updateEntry(e.uid, patch)}
              onDelete={() => { removeEntry(e.uid); if (editing === e.uid) setEditing(null); }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Một entry (thẻ + form sửa) ── */
const EntryRow: React.FC<{
  entry: LoreEntry;
  open: boolean;
  onToggle: () => void;
  onChange: (p: Partial<LoreEntry>) => void;
  onDelete: () => void;
}> = ({ entry: e, open, onToggle, onChange, onDelete }) => {
  const setKeys = (v: string) => onChange({ key: v.split(',').map(s => s.trim()).filter(Boolean) });
  const setSecKeys = (v: string) => onChange({ keysecondary: v.split(',').map(s => s.trim()).filter(Boolean) });

  return (
    <div className={`lb-entry ${e.disable ? 'lb-entry--off' : ''}`}>
      <div className="lb-entry-head" onClick={onToggle}>
        <span className={`lb-dot ${e.constant ? 'lb-dot--on' : ''}`} title={e.constant ? 'Constant (đèn xanh)' : 'Normal'} />
        <span className="lb-entry-title">{e.comment || `Entry #${e.uid}`}</span>
        <span className="lb-entry-keys">{e.constant ? '⟨luôn bật⟩' : (e.key.slice(0, 3).join(', ') || 'chưa có key')}</span>
        <span className="lb-entry-pos">P{e.position}·O{e.order}</span>
      </div>

      {open && (
        <div className="lb-form">
          <div className="lb-field lb-field--full">
            <label>Tiêu đề (memo)</label>
            <input className="input" value={e.comment} onChange={ev => onChange({ comment: ev.target.value })} placeholder="Tên định danh entry" />
          </div>
          <div className="lb-field lb-field--full">
            <label>Từ khóa chính (phân tách bằng dấu phẩy)</label>
            <input className="input" value={e.key.join(', ')} onChange={ev => setKeys(ev.target.value)} placeholder="vd: Zeus, Thần Sấm, Olympus" disabled={e.constant} />
          </div>
          <div className="lb-field lb-field--full">
            <label>Nội dung</label>
            <textarea className="input" rows={4} value={e.content} onChange={ev => onChange({ content: ev.target.value })} placeholder="Thông tin AI sẽ nhớ khi entry kích hoạt..." />
          </div>

          <div className="lb-grid">
            <label className="lb-check">
              <input type="checkbox" checked={e.constant} onChange={ev => onChange({ constant: ev.target.checked })} />
              🟢 Constant (đèn xanh)
            </label>
            <label className="lb-check">
              <input type="checkbox" checked={e.disable} onChange={ev => onChange({ disable: ev.target.checked })} />
              Tắt entry
            </label>
            <label className="lb-check">
              <input type="checkbox" checked={e.excludeRecursion} onChange={ev => onChange({ excludeRecursion: ev.target.checked })} />
              Non-recursable (chặn đầu vào)
            </label>
            <label className="lb-check">
              <input type="checkbox" checked={e.preventRecursion} onChange={ev => onChange({ preventRecursion: ev.target.checked })} />
              Prevent recursion (chặn đầu ra)
            </label>
            <label className="lb-check">
              <input type="checkbox" checked={e.ignoreBudget} onChange={ev => onChange({ ignoreBudget: ev.target.checked })} />
              Bỏ qua ngân sách
            </label>
          </div>

          <div className="lb-grid">
            <div className="lb-field">
              <label>Vị trí</label>
              <select className="input" value={String(e.position)} onChange={ev => onChange({ position: Number(ev.target.value) })}>
                {POSITIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            {e.position === 4 && (
              <>
                <div className="lb-field">
                  <label>Depth</label>
                  <input className="input" type="number" min={0} max={20} value={e.depth} onChange={ev => onChange({ depth: Number(ev.target.value) })} />
                </div>
                <div className="lb-field">
                  <label>Vai trò</label>
                  <select className="input" value={String(e.role ?? 0)} onChange={ev => onChange({ role: Number(ev.target.value) })}>
                    {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </div>
              </>
            )}
            <div className="lb-field">
              <label>Order</label>
              <input className="input" type="number" value={e.order} onChange={ev => onChange({ order: Number(ev.target.value) })} />
            </div>
            <div className="lb-field">
              <label>Xác suất %</label>
              <input className="input" type="number" min={0} max={100} value={e.probability} onChange={ev => onChange({ probability: Number(ev.target.value) })} />
            </div>
          </div>

          {!e.constant && (
            <div className="lb-grid">
              <div className="lb-field lb-field--full">
                <label>Từ khóa phụ (logic bên dưới)</label>
                <input className="input" value={e.keysecondary.join(', ')} onChange={ev => setSecKeys(ev.target.value)} placeholder="Tùy chọn" />
              </div>
              <div className="lb-field">
                <label>Logic phụ</label>
                <select className="input" value={String(e.selectiveLogic)} onChange={ev => onChange({ selectiveLogic: Number(ev.target.value) })}>
                  {LOGICS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className="lb-field"><label>Sticky</label><input className="input" type="number" min={0} value={e.sticky} onChange={ev => onChange({ sticky: Number(ev.target.value) })} /></div>
              <div className="lb-field"><label>Cooldown</label><input className="input" type="number" min={0} value={e.cooldown} onChange={ev => onChange({ cooldown: Number(ev.target.value) })} /></div>
              <div className="lb-field"><label>Delay</label><input className="input" type="number" min={0} value={e.delay} onChange={ev => onChange({ delay: Number(ev.target.value) })} /></div>
            </div>
          )}

          <div className="lb-form-actions">
            <button className="btn btn-sm btn-danger" onClick={onDelete}>Xóa entry</button>
            <button className="btn btn-sm" onClick={onToggle}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LorebookPanel;
