/* ═══════════════════════════════════════════════════════
   MVU SNAPSHOT — Per-turn state snapshots for reroll/undo
   ═══════════════════════════════════════════════════════ */

import type { StatData } from './schema';

export interface StateSnapshot {
  turn: number;
  timestamp: number;
  state: StatData;
}

/** Ring buffer of snapshots, keeps last N */
const MAX_SNAPSHOTS = 50;

let snapshots: StateSnapshot[] = [];

/** Save a snapshot before a turn begins */
export function saveSnapshot(turn: number, state: StatData): void {
  snapshots.push({
    turn,
    timestamp: Date.now(),
    state: structuredClone(state),
  });
  // Trim old snapshots
  if (snapshots.length > MAX_SNAPSHOTS) {
    snapshots = snapshots.slice(-MAX_SNAPSHOTS);
  }
}

/** Get the snapshot for a specific turn */
export function getSnapshot(turn: number): StateSnapshot | undefined {
  // Find the most recent snapshot at or before the given turn
  for (let i = snapshots.length - 1; i >= 0; i--) {
    if (snapshots[i].turn <= turn) return snapshots[i];
  }
  return undefined;
}

/** Get the most recent snapshot */
export function getLatestSnapshot(): StateSnapshot | undefined {
  return snapshots[snapshots.length - 1];
}

/** Rollback to a specific turn's snapshot */
export function rollbackTo(turn: number): StatData | null {
  const snap = getSnapshot(turn);
  if (!snap) return null;
  // Remove all snapshots after the rollback point
  snapshots = snapshots.filter(s => s.turn <= turn);
  return structuredClone(snap.state);
}

/** Clear all snapshots (for new game) */
export function clearSnapshots(): void {
  snapshots = [];
}

/** Get snapshot count (for debug) */
export function getSnapshotCount(): number {
  return snapshots.length;
}

/** Export snapshots for save file */
export function exportSnapshots(): StateSnapshot[] {
  return structuredClone(snapshots);
}

/** Import snapshots from save file */
export function importSnapshots(imported: StateSnapshot[]): void {
  snapshots = structuredClone(imported);
}
