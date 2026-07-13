import React, { useMemo, useState } from 'react';
import type { GraphNode, GraphConfig } from './studioTypes';

/* ═══════════════════════════════════════════════════════
   NODE TREE — Cây/đồ thị node tự bố cục (SVG)
   Dùng cho: Cây Tiến Hóa (sinh vật), Thang Cảnh Giới (sức mạnh)
   ═══════════════════════════════════════════════════════ */

interface Props {
  nodes: GraphNode[];
  rootLabel: string;
  accent: string;
  config?: GraphConfig;
  onChange: (nodes: GraphNode[]) => void;
}

const ROOT = '__root__';
const NODE_W = 158;
const NODE_H = 54;
const H_GAP = 26;
const V_GAP = 62;
const PAD = 18;

interface Pos { x: number; y: number }

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export const NodeTree: React.FC<Props> = ({ nodes, rootLabel, accent, config, onChange }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const chain = (config?.mode ?? 'tree') === 'chain';

  const childrenOf = (id: string) =>
    id === ROOT ? nodes.filter(n => n.parent === null) : nodes.filter(n => n.parent === id);

  // ── Auto layout (tidy tree) ──
  const { pos, width, height } = useMemo(() => {
    const p = new Map<string, Pos>();
    let cursor = PAD;
    let maxDepth = 0;
    const visited = new Set<string>();

    const layout = (id: string, depth: number): number => {
      if (visited.has(id)) return cursor;
      visited.add(id);
      maxDepth = Math.max(maxDepth, depth);
      const y = PAD + depth * (NODE_H + V_GAP);
      const kids = id === ROOT ? nodes.filter(n => n.parent === null) : nodes.filter(n => n.parent === id);
      if (kids.length === 0) {
        const x = cursor;
        cursor += NODE_W + H_GAP;
        p.set(id, { x, y });
        return x + NODE_W / 2;
      }
      const centers = kids.map(k => layout(k.id, depth + 1));
      const cx = (centers[0] + centers[centers.length - 1]) / 2 - NODE_W / 2;
      p.set(id, { x: cx, y });
      return cx + NODE_W / 2;
    };
    layout(ROOT, 0);

    const w = Math.max(cursor - H_GAP + PAD, NODE_W + PAD * 2);
    const h = PAD * 2 + (maxDepth + 1) * NODE_H + maxDepth * V_GAP;
    return { pos: p, width: w, height: h };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes]);

  const rootPos = pos.get(ROOT)!;

  // ── Mutations ──
  const addChild = (parentId: string | null) => {
    const node: GraphNode = { id: crypto.randomUUID(), parent: parentId, title: '', meta: '', detail: '' };
    onChange([...nodes, node]);
    setSelected(node.id);
  };
  const addSmart = () => {
    // chain: nối vào node sâu nhất; tree: nhánh từ node đang chọn (hoặc gốc)
    if (chain) {
      const leaf = nodes.find(n => !nodes.some(c => c.parent === n.id));
      addChild(leaf ? leaf.id : null);
    } else {
      addChild(selected && selected !== ROOT ? selected : null);
    }
  };
  const update = (id: string, patch: Partial<GraphNode>) =>
    onChange(nodes.map(n => (n.id === id ? { ...n, ...patch } : n)));
  const remove = (id: string) => {
    const target = nodes.find(n => n.id === id);
    if (!target) return;
    onChange(nodes.filter(n => n.id !== id).map(n => (n.parent === id ? { ...n, parent: target.parent } : n)));
    setSelected(null);
  };

  const sel = selected && selected !== ROOT ? nodes.find(n => n.id === selected) : null;

  return (
    <div className="nt" style={{ '--nt-accent': accent } as React.CSSProperties}>
      <div className="nt-toolbar">
        <button type="button" className="nt-add" onClick={addSmart}
          style={{ borderColor: `${accent}66`, color: accent, background: `${accent}16` }}>
          + {config?.addLabel ?? (chain ? 'Thêm cảnh giới' : 'Thêm nhánh')}
        </button>
        <span className="nt-hint">
          {chain
            ? 'Chuỗi tuần tự — mỗi cấp nối tiếp cấp trước.'
            : 'Bấm một node để chọn, rồi “Thêm nhánh” để mọc nhánh con từ đó.'}
        </span>
      </div>

      <div className="nt-canvas">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="nt-svg">
          {/* Edges */}
          {nodes.map(n => {
            const parentId = n.parent ?? ROOT;
            const from = pos.get(parentId);
            const to = pos.get(n.id);
            if (!from || !to) return null;
            const px = from.x + NODE_W / 2, py = from.y + NODE_H;
            const cx = to.x + NODE_W / 2, cy = to.y;
            const my = (py + cy) / 2;
            return (
              <path key={`e-${n.id}`} d={`M ${px} ${py} C ${px} ${my}, ${cx} ${my}, ${cx} ${cy}`}
                fill="none" stroke={`${accent}66`} strokeWidth={1.6} />
            );
          })}

          {/* Root node */}
          <g transform={`translate(${rootPos.x}, ${rootPos.y})`} className="nt-node nt-node--root"
            onClick={() => setSelected(ROOT)} style={{ cursor: 'pointer' }}>
            <rect width={NODE_W} height={NODE_H} rx={12}
              fill={`${accent}26`} stroke={accent} strokeWidth={selected === ROOT ? 2.4 : 1.6} />
            <text x={NODE_W / 2} y={20} textAnchor="middle" className="nt-node-title" fill="var(--text-primary)">
              {truncate(rootLabel || 'Bản thể', 18)}
            </text>
            <text x={NODE_W / 2} y={38} textAnchor="middle" className="nt-node-meta" fill={accent}>
              {chain ? (config?.rootHint ?? 'Khởi điểm') : (config?.rootHint ?? 'GỐC')}
            </text>
          </g>

          {/* Nodes */}
          {nodes.map(n => {
            const p = pos.get(n.id);
            if (!p) return null;
            const on = selected === n.id;
            return (
              <g key={n.id} transform={`translate(${p.x}, ${p.y})`} className="nt-node"
                onClick={() => setSelected(n.id)} style={{ cursor: 'pointer' }}>
                <rect width={NODE_W} height={NODE_H} rx={11}
                  fill="rgba(22,24,34,0.92)" stroke={on ? accent : 'var(--glass-border-light)'}
                  strokeWidth={on ? 2.4 : 1.4}
                  style={on ? { filter: `drop-shadow(0 0 8px ${accent}66)` } : undefined} />
                {n.num != null && (
                  <>
                    <rect x={NODE_W - 34} y={8} width={26} height={16} rx={8} fill={`${accent}2a`} stroke={`${accent}66`} strokeWidth={1} />
                    <text x={NODE_W - 21} y={20} textAnchor="middle" className="nt-node-num" fill={accent}>{n.num}</text>
                  </>
                )}
                <text x={12} y={22} className="nt-node-title" fill="var(--text-primary)">
                  {truncate(n.title || 'Chưa đặt tên', n.num != null ? 15 : 19)}
                </text>
                <text x={12} y={40} className="nt-node-meta" fill="var(--text-muted)">
                  {truncate(n.meta || '—', 22)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Inline node editor */}
      {sel ? (
        <div className="nt-editor" style={{ borderColor: `${accent}44` }}>
          <div className="nt-editor-row">
            <input className="input nt-in-title" value={sel.title}
              placeholder={config?.titleLabel ?? 'Tên node'}
              onChange={e => update(sel.id, { title: e.target.value })} />
            {config?.numeric && (
              <input className="input nt-in-num" type="number" value={sel.num ?? ''}
                placeholder={config.numeric}
                onChange={e => update(sel.id, { num: e.target.value === '' ? undefined : Number(e.target.value) })} />
            )}
          </div>
          <input className="input" value={sel.meta}
            placeholder={config?.metaLabel ?? 'Điều kiện / biểu hiện'}
            onChange={e => update(sel.id, { meta: e.target.value })} />
          <textarea className="input nt-in-detail" value={sel.detail} rows={2}
            placeholder={config?.detailLabel ?? 'Mô tả'}
            onChange={e => update(sel.id, { detail: e.target.value })} />
          <div className="nt-editor-actions">
            {!chain && (
              <button type="button" className="nt-branch" onClick={() => addChild(sel.id)}
                style={{ color: accent, borderColor: `${accent}55` }}>
                + Nhánh con từ đây
              </button>
            )}
            <button type="button" className="nt-del" onClick={() => remove(sel.id)}>Xóa node</button>
          </div>
        </div>
      ) : (
        <p className="nt-empty-hint">
          {nodes.length === 0
            ? `Chưa có ${chain ? 'cảnh giới' : 'nhánh tiến hóa'} nào. Bấm “${config?.addLabel ?? 'Thêm'}” để bắt đầu.`
            : 'Bấm một node trên cây để chỉnh sửa.'}
        </p>
      )}
    </div>
  );
};

export default NodeTree;
