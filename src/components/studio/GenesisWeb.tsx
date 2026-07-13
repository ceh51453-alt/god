import React, { useMemo } from 'react';
import { useStudioStore } from './studioStore';
import { CATEGORIES, getCategory, asArr, type StudioEntity } from './studioTypes';

/* ═══════════════════════════════════════════════════════
   GENESIS WEB — Sơ đồ node của toàn bộ Xưởng Sáng Thế
   Cột = phân hệ · node = tạo vật · cạnh = liên kết (relations)
   ═══════════════════════════════════════════════════════ */

const COL_W = 150;
const COL_GAP = 78;
const NODE_H = 40;
const NODE_VGAP = 14;
const TOP = 46;
const PAD = 22;

function truncate(s: string, n: number): string {
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

interface Placed { e: StudioEntity; x: number; y: number; accent: string }

export const GenesisWeb: React.FC = () => {
  const entities = useStudioStore(s => s.entities);
  const openEditor = useStudioStore(s => s.openEditor);
  const setActiveCategory = useStudioStore(s => s.setActiveCategory);

  const { placed, edges, columns, width, height } = useMemo(() => {
    const cols = CATEGORIES.filter(c => entities.some(e => e.category === c.id));
    const posMap = new Map<string, Placed>();
    const colInfos: { name: string; accent: string; x: number }[] = [];
    let maxRows = 0;

    cols.forEach((c, i) => {
      const x = PAD + i * (COL_W + COL_GAP);
      colInfos.push({ name: c.name, accent: c.accent, x });
      const list = entities.filter(e => e.category === c.id);
      maxRows = Math.max(maxRows, list.length);
      list.forEach((e, j) => {
        posMap.set(e.id, { e, x, y: TOP + PAD + j * (NODE_H + NODE_VGAP), accent: c.accent });
      });
    });

    // Edges from relations fields
    const es: { from: Placed; to: Placed; color: string }[] = [];
    for (const e of entities) {
      const def = getCategory(e.category);
      const from = posMap.get(e.id);
      if (!from) continue;
      for (const f of def.fields) {
        if (f.type !== 'relations') continue;
        for (const targetId of asArr(e.values[f.id])) {
          const to = posMap.get(targetId);
          if (to) es.push({ from, to, color: from.accent });
        }
      }
    }

    const w = Math.max(PAD * 2 + cols.length * (COL_W + COL_GAP) - COL_GAP, 320);
    const h = Math.max(TOP + PAD * 2 + maxRows * (NODE_H + NODE_VGAP), 240);
    return { placed: [...posMap.values()], edges: es, columns: colInfos, width: w, height: h };
  }, [entities]);

  const openNode = (e: StudioEntity) => {
    setActiveCategory(e.category);
    openEditor(e.id);
  };

  if (entities.length === 0) {
    return <div className="gw-empty">Chưa có tạo vật nào để dệt sơ đồ. Hãy sáng tạo ở chế độ Danh Sách trước.</div>;
  }

  return (
    <div className="gw">
      <div className="gw-legend">
        {columns.map(c => (
          <span key={c.name} className="gw-legend-item">
            <span className="gw-legend-dot" style={{ background: c.accent }} />{c.name}
          </span>
        ))}
      </div>

      <div className="gw-canvas">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="gw-svg">
          {/* Column labels */}
          {columns.map(c => (
            <text key={c.name} x={c.x + COL_W / 2} y={26} textAnchor="middle" className="gw-col-label" fill={c.accent}>
              {c.name.toUpperCase()}
            </text>
          ))}

          {/* Edges */}
          {edges.map((ed, i) => {
            const x1 = ed.from.x + COL_W / 2, y1 = ed.from.y + NODE_H / 2;
            const x2 = ed.to.x + COL_W / 2, y2 = ed.to.y + NODE_H / 2;
            const mx = (x1 + x2) / 2;
            return (
              <path key={i} d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                fill="none" stroke={`${ed.color}55`} strokeWidth={1.5} />
            );
          })}

          {/* Nodes */}
          {placed.map(p => (
            <g key={p.e.id} className="gw-node" transform={`translate(${p.x}, ${p.y})`}
              style={{ cursor: 'pointer' }} onClick={() => openNode(p.e)}>
              <rect width={COL_W} height={NODE_H} rx={9}
                fill={`${p.accent}1f`} stroke={`${p.accent}88`} strokeWidth={1.4} />
              <rect width={4} height={NODE_H} rx={2} fill={p.accent} />
              <text x={14} y={NODE_H / 2 + 4} className="gw-node-name" fill="var(--text-primary)">
                {truncate(p.e.name || 'Vô Danh', 17)}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default GenesisWeb;
