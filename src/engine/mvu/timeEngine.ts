/* ═══════════════════════════════════════════════════════
   TIME ENGINE — Đồng hồ in-world do Engine sở hữu.
   AI đẩy thời gian bằng delta patch (world.time.day +N),
   Engine tự tính tràn Ngày → Mùa → Năm theo chu kỳ đã định.
   Thời gian đơn điệu (không chạy lùi) ⇒ nhân vật/sự kiện
   luôn tôn trọng một dòng thời gian nhất quán.
   ═══════════════════════════════════════════════════════ */

import type { StatData, WorldTimeData } from './schema';

/** Nhãn mùa hiện tại (theo seasonNames nếu người chơi đã đặt tên). */
export function seasonLabel(t: WorldTimeData): string {
  const spy = Math.max(1, t.seasonsPerYear || 1);
  const idx = ((t.season % spy) + spy) % spy;
  if (t.seasonNames && t.seasonNames.length > 0) {
    return t.seasonNames[idx % t.seasonNames.length] || `Mùa ${idx + 1}`;
  }
  return `Mùa ${idx + 1}`;
}

/** Chuỗi thời gian in-world cho prompt & UI. */
export function formatWorldTime(t: WorldTimeData | undefined | null): string | null {
  if (!t) return null;
  const cal = t.calendarName || 'Lịch Thế Giới';
  const bits: string[] = [];
  if (t.epochLabel) bits.push(t.epochLabel);
  bits.push(`Năm ${t.year}`);
  bits.push(seasonLabel(t));
  bits.push(`Ngày ${t.day + 1}/${Math.max(1, t.daysPerSeason)}`);
  return `${cal} — ${bits.join(' · ')}`;
}

/**
 * Chuẩn hóa đồng hồ: dồn tràn Ngày → Mùa → Năm, chặn số âm.
 * Gọi trong runDerivedEffects sau mỗi lần áp patch.
 */
export function normalizeTime(state: StatData): StatData {
  const t = state.world?.time as WorldTimeData | undefined;
  if (!t) return state;

  const dps = Math.max(1, Math.floor(t.daysPerSeason || 1));
  const spy = Math.max(1, Math.floor(t.seasonsPerYear || 1));

  // Chặn lùi/âm: sàn về 0.
  let day = Math.max(0, Math.floor(t.day));
  let season = Math.max(0, Math.floor(t.season));
  let year = Math.max(0, Math.floor(t.year));
  const epoch = Math.max(0, Math.floor(t.epoch));

  // Dồn tràn Ngày → Mùa.
  if (day >= dps) { season += Math.floor(day / dps); day = day % dps; }
  // Dồn tràn Mùa → Năm.
  if (season >= spy) { year += Math.floor(season / spy); season = season % spy; }

  if (day === t.day && season === t.season && year === t.year && epoch === t.epoch) {
    return state; // không đổi → tránh clone thừa
  }
  return {
    ...state,
    world: { ...state.world, time: { ...t, day, season, year, epoch } },
  };
}
