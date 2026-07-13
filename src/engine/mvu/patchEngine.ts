/* ═══════════════════════════════════════════════════════
   MVU PATCH ENGINE — 5 operation types for state updates
   Engine giữ số: parse AI output → validate → apply
   ═══════════════════════════════════════════════════════ */

import type { StatData } from './schema';

// ── Patch Operation Types ──

export interface PatchOpReplace {
  op: 'replace';
  path: string;   // dot-notation path, e.g. "resources.power"
  value: unknown;
}

export interface PatchOpDelta {
  op: 'delta';
  path: string;
  value: number;  // +/- amount
}

export interface PatchOpInsert {
  op: 'insert';
  path: string;   // path to array or record
  key?: string;    // for records
  value: unknown;
}

export interface PatchOpRemove {
  op: 'remove';
  path: string;
  key?: string;    // for records
  index?: number;  // for arrays
}

export interface PatchOpMove {
  op: 'move';
  from: string;
  to: string;
}

export type MvuPatchOp = PatchOpReplace | PatchOpDelta | PatchOpInsert | PatchOpRemove | PatchOpMove;

// ── Read a value at a dot-notation path ──

export function getAtPath(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

// ── Set a value at a dot-notation path (immutable) ──

export function setAtPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  value: unknown,
): T {
  const parts = path.split('.');
  if (parts.length === 0) return obj;

  const clone = { ...obj } as Record<string, unknown>;
  let current = clone;

  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const next = current[key];
    if (next != null && typeof next === 'object' && !Array.isArray(next)) {
      current[key] = { ...(next as Record<string, unknown>) };
    } else if (Array.isArray(next)) {
      current[key] = [...next];
    } else {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }

  const lastKey = parts[parts.length - 1];
  current[lastKey] = value;

  return clone as T;
}

// ── Delete a key at a dot-notation path (immutable) ──

export function deleteAtPath<T extends Record<string, unknown>>(
  obj: T,
  path: string,
  key?: string,
  index?: number,
): T {
  if (key != null) {
    // Delete from record
    const record = getAtPath(obj, path);
    if (record != null && typeof record === 'object' && !Array.isArray(record)) {
      const clone = { ...(record as Record<string, unknown>) };
      delete clone[key];
      return setAtPath(obj, path, clone);
    }
  }
  if (index != null) {
    // Delete from array
    const arr = getAtPath(obj, path);
    if (Array.isArray(arr)) {
      const clone = [...arr];
      clone.splice(index, 1);
      return setAtPath(obj, path, clone);
    }
  }
  // Delete the path itself
  const parts = path.split('.');
  if (parts.length <= 1) {
    const clone = { ...obj } as Record<string, unknown>;
    delete clone[path];
    return clone as T;
  }
  const parentPath = parts.slice(0, -1).join('.');
  const lastKey = parts[parts.length - 1];
  const parent = getAtPath(obj, parentPath);
  if (parent != null && typeof parent === 'object' && !Array.isArray(parent)) {
    const clone = { ...(parent as Record<string, unknown>) };
    delete clone[lastKey];
    return setAtPath(obj, parentPath, clone);
  }
  return obj;
}

// ── Readonly field guard ──

const READONLY_PREFIX = '_';

function isReadonlyPath(path: string): boolean {
  const parts = path.split('.');
  const lastPart = parts[parts.length - 1];
  return lastPart.startsWith(READONLY_PREFIX);
}

// ── Apply a single patch op ──

export function applyPatchOp(state: StatData, op: MvuPatchOp): StatData {
  const stateObj = state as unknown as Record<string, unknown>;

  switch (op.op) {
    case 'replace': {
      if (isReadonlyPath(op.path)) return state;
      return setAtPath(stateObj, op.path, op.value) as unknown as StatData;
    }

    case 'delta': {
      if (isReadonlyPath(op.path)) return state;
      const current = getAtPath(stateObj, op.path);
      const currentNum = typeof current === 'number' ? current : 0;
      return setAtPath(stateObj, op.path, currentNum + op.value) as unknown as StatData;
    }

    case 'insert': {
      if (isReadonlyPath(op.path)) return state;
      const target = getAtPath(stateObj, op.path);

      if (Array.isArray(target)) {
        return setAtPath(stateObj, op.path, [...target, op.value]) as unknown as StatData;
      }
      if (target != null && typeof target === 'object' && op.key) {
        const record = { ...(target as Record<string, unknown>) };
        record[op.key] = op.value;
        return setAtPath(stateObj, op.path, record) as unknown as StatData;
      }
      // Path doesn't exist yet — create record with key
      if (op.key) {
        return setAtPath(stateObj, op.path, { [op.key]: op.value }) as unknown as StatData;
      }
      return state;
    }

    case 'remove': {
      if (isReadonlyPath(op.path)) return state;
      return deleteAtPath(stateObj, op.path, op.key, op.index) as unknown as StatData;
    }

    case 'move': {
      if (isReadonlyPath(op.to)) return state;
      const val = getAtPath(stateObj, op.from);
      if (val === undefined) return state;
      let result = deleteAtPath(stateObj, op.from) as unknown as StatData;
      result = setAtPath(result as unknown as Record<string, unknown>, op.to, val) as unknown as StatData;
      return result;
    }

    default:
      return state;
  }
}

// ── Apply a batch of patches ──

export function applyPatches(state: StatData, ops: MvuPatchOp[]): StatData {
  let result = state;
  for (const op of ops) {
    result = applyPatchOp(result, op);
  }
  return result;
}

// ── Filter out unsafe ops from AI ──

export function filterAIPatches(ops: MvuPatchOp[]): MvuPatchOp[] {
  return ops.filter(op => {
    const path = 'path' in op ? op.path : ('to' in op ? op.to : '');
    // Block writes to readonly fields
    if (isReadonlyPath(path)) return false;
    // Block writes to _derived, _seed, _version, _turnCount, _affinityStage
    const parts = path.split('.');
    if (parts.some(p => p.startsWith('_'))) return false;
    return true;
  });
}
