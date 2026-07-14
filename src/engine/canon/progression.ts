/* ═══════════════════════════════════════════════════════
   PROGRESSION OVERRIDE — Thang cảnh giới do người chơi thiết kế
   lên ngôi. Nếu creator đã dựng một "Hệ Thống Sức Mạnh" trong
   Xưởng (power.tiers), dùng CHÍNH thang đó làm cấp bậc tiến
   trình thay cho PATH_TIERS mặc định — tên & thứ tự theo đúng
   thiết kế, ngưỡng số do Engine sinh để kinh tế tiến trình
   vẫn nhất quán.
   ═══════════════════════════════════════════════════════ */

import type { GamePath } from '@/components/creation/creationData';
import type { StudioEntity } from '@/components/studio/studioTypes';
import { PATH_TIERS, type Tier } from '../mechanics/pathMechanics';

export interface LadderOverride {
  label: string;
  tiers: Tier[];
  sourceName: string;
}

interface RawTier { title: string; detail: string; meta: string }

function powerTierNodes(e: StudioEntity): RawTier[] {
  const raw = e.values['tiers'];
  if (!Array.isArray(raw)) return [];
  const out: RawTier[] = [];
  for (const n of raw) {
    if (!n || typeof n !== 'object') continue;
    const o = n as unknown as Record<string, unknown>;
    const title = typeof o.title === 'string' ? o.title.trim() : '';
    if (!title) continue;
    out.push({
      title,
      detail: typeof o.detail === 'string' ? o.detail.trim() : '',
      meta: typeof o.meta === 'string' ? o.meta.trim() : '',
    });
  }
  return out;
}

/**
 * Tìm "hệ sức mạnh chính" = power entity có thang cảnh giới dài nhất (≥2 bậc),
 * rồi dựng ladder với ngưỡng tiến trình theo đường cong của path hiện tại.
 * Trả null nếu creator chưa thiết kế hệ sức mạnh nào.
 */
export function getProgressionOverride(
  path: GamePath,
  studioEntities: StudioEntity[] | undefined,
): LadderOverride | null {
  if (!studioEntities || studioEntities.length === 0) return null;

  let best: { e: StudioEntity; nodes: RawTier[] } | null = null;
  for (const e of studioEntities) {
    if (e.category !== 'power') continue;
    const nodes = powerTierNodes(e);
    if (nodes.length < 2) continue;
    if (!best || nodes.length > best.nodes.length) best = { e, nodes };
  }
  if (!best) return null;

  const template = PATH_TIERS[path];
  const maxAt = template[template.length - 1]?.at || 1000;
  const N = best.nodes.length;

  const tiers: Tier[] = best.nodes.map((nd, i) => ({
    name: nd.title,
    // Ngưỡng cong tăng dần: bậc đầu = 0, bậc cuối = maxAt của path.
    at: i === 0 ? 0 : Math.round(maxAt * Math.pow(i / (N - 1), 1.6)),
    desc: nd.detail || nd.meta || '',
  }));

  return {
    label: `Cảnh Giới — ${best.e.name || 'Hệ Sức Mạnh'}`,
    tiers,
    sourceName: best.e.name || '',
  };
}
