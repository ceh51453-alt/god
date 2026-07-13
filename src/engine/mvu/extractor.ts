/* ═══════════════════════════════════════════════════════
   MVU EXTRACTOR — Parse <UpdateVariable> from AI output
   Extracts JSON patches from AI response text, filters
   readonly fields, and returns clean text + patch ops.
   ═══════════════════════════════════════════════════════ */

import type { MvuPatchOp } from './patchEngine';
import { filterAIPatches } from './patchEngine';

export interface ExtractionResult {
  /** Clean narrative text (patches stripped) */
  cleanText: string;
  /** Validated patch operations */
  patches: MvuPatchOp[];
  /** Raw extracted blocks (for debug) */
  rawBlocks: string[];
  /** Any parse errors */
  errors: string[];
}

/**
 * Regex to match <UpdateVariable> blocks in AI response.
 * Supports both XML-style and markdown code block wrapping.
 */
const UPDATE_REGEX = /<UpdateVariable>([\s\S]*?)<\/UpdateVariable>/gi;
const JSON_BLOCK_REGEX = /```(?:json)?\s*([\s\S]*?)```/gi;

/**
 * Extract and parse MVU patches from AI response text.
 * Strips the patch blocks from the visible narrative.
 */
export function extractPatches(aiResponse: string): ExtractionResult {
  const rawBlocks: string[] = [];
  const errors: string[] = [];
  let allOps: MvuPatchOp[] = [];

  // ── Extract from <UpdateVariable> tags ──
  let cleanText = aiResponse.replace(UPDATE_REGEX, (_match, inner: string) => {
    rawBlocks.push(inner.trim());
    return ''; // Strip from visible text
  });

  // ── Parse each block ──
  for (const block of rawBlocks) {
    // Try to extract JSON — may be wrapped in ```json...```
    let jsonStr = block;
    const jsonMatch = JSON_BLOCK_REGEX.exec(block);
    if (jsonMatch) {
      jsonStr = jsonMatch[1];
    }
    JSON_BLOCK_REGEX.lastIndex = 0; // Reset regex state

    try {
      const parsed = JSON.parse(jsonStr);
      const ops = normalizeOps(parsed);
      allOps.push(...ops);
    } catch {
      errors.push(`Failed to parse patch block: ${block.slice(0, 100)}...`);
    }
  }

  // ── Filter out readonly/engine-only fields ──
  allOps = filterAIPatches(allOps);

  // ── Clean up whitespace from stripped blocks ──
  cleanText = cleanText
    .replace(/\n{3,}/g, '\n\n')  // Remove excessive newlines
    .trim();

  return { cleanText, patches: allOps, rawBlocks, errors };
}

/**
 * Normalize various formats AI might use into MvuPatchOp[]:
 *
 * Format 1: Array of ops
 *   [{ "op": "replace", "path": "resources.power", "value": 150 }]
 *
 * Format 2: Single op object
 *   { "op": "delta", "path": "resources.power", "value": 10 }
 *
 * Format 3: Shorthand key-value (treat as replace ops)
 *   { "resources.power": 150, "resources.followers": 1000 }
 *
 * Format 4: Nested object (treat as replace ops)
 *   { "resources": { "power": 150 }, "name": "Zeus" }
 */
function normalizeOps(parsed: unknown): MvuPatchOp[] {
  if (Array.isArray(parsed)) {
    return parsed.flatMap(item => normalizeOps(item));
  }

  if (parsed == null || typeof parsed !== 'object') return [];

  const obj = parsed as Record<string, unknown>;

  // Format 2: Single op with 'op' field
  if ('op' in obj && typeof obj.op === 'string') {
    return [validateOp(obj)].filter(Boolean) as MvuPatchOp[];
  }

  // Format 3 & 4: Key-value shorthand
  const ops: MvuPatchOp[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value != null && !Array.isArray(value)) {
      // Nested object — flatten
      for (const [subKey, subVal] of Object.entries(value as Record<string, unknown>)) {
        ops.push({ op: 'replace', path: `${key}.${subKey}`, value: subVal });
      }
    } else {
      ops.push({ op: 'replace', path: key, value });
    }
  }
  return ops;
}

function validateOp(obj: Record<string, unknown>): MvuPatchOp | null {
  const op = obj.op as string;
  switch (op) {
    case 'replace':
      if (typeof obj.path !== 'string') return null;
      return { op: 'replace', path: obj.path, value: obj.value };

    case 'delta':
      if (typeof obj.path !== 'string' || typeof obj.value !== 'number') return null;
      return { op: 'delta', path: obj.path, value: obj.value };

    case 'insert':
      if (typeof obj.path !== 'string') return null;
      return {
        op: 'insert',
        path: obj.path,
        key: typeof obj.key === 'string' ? obj.key : undefined,
        value: obj.value,
      };

    case 'remove':
      if (typeof obj.path !== 'string') return null;
      return {
        op: 'remove',
        path: obj.path,
        key: typeof obj.key === 'string' ? obj.key : undefined,
        index: typeof obj.index === 'number' ? obj.index : undefined,
      };

    case 'move':
      if (typeof obj.from !== 'string' || typeof obj.to !== 'string') return null;
      return { op: 'move', from: obj.from, to: obj.to };

    default:
      return null;
  }
}
