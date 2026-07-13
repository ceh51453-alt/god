/* ═══════════════════════════════════════════════════════
   MVU-ZOD STATE SCHEMA — Single source of truth
   Engine giữ số, AI giữ lời.
   ═══════════════════════════════════════════════════════ */

import { z } from 'zod/v4';

// ── Utility schemas ──

/** Safe string: trim + max chars */
const safeStr = (max = 500) =>
  z.string().max(max).transform(s => s.trim()).default('');

/** Clamped number */
const cNum = (min: number, max: number, def: number) =>
  z.number()
    .transform(v => Math.max(min, Math.min(max, v)))
    .default(def);

/** Clamped integer */
const cInt = (min: number, max: number, def: number) =>
  z.number()
    .int()
    .transform(v => Math.max(min, Math.min(max, v)))
    .default(def);

// ── Re-export for external use ──
export const safeString = safeStr;
export const clampedStat = cNum;
export const clampedInt = cInt;

// ── Affinity stages ──

export const AffinityStage = z.enum([
  'Thù Địch', 'Địch Ý', 'Bất Mãn', 'Cảnh Giác',
  'Trung Lập', 'Cảm Mến', 'Ủng Hộ', 'Tín Nhiệm', 'Thân Mật'
]);

export function deriveAffinityStage(value: number): z.infer<typeof AffinityStage> {
  if (value <= -80) return 'Thù Địch';
  if (value <= -60) return 'Địch Ý';
  if (value <= -30) return 'Bất Mãn';
  if (value <= -10) return 'Cảnh Giác';
  if (value <= 10) return 'Trung Lập';
  if (value <= 30) return 'Cảm Mến';
  if (value <= 60) return 'Ủng Hộ';
  if (value <= 80) return 'Tín Nhiệm';
  return 'Thân Mật';
}

// ── NPC Schema ──

export const NpcSchema = z.object({
  name: safeStr(200),
  title: safeStr(200),
  affinity: cInt(-100, 100, 0),
  _affinityStage: AffinityStage.default('Trung Lập'),
  loyalty: cInt(-100, 100, 50),
  alive: z.boolean().default(true),
  role: safeStr(200),
  personality: safeStr(300),
  memories: z.array(safeStr(300)).default([]),
  promises: z.array(safeStr(300)).default([]),
});

// ── Entity Schema ──

export const EntitySchema = z.object({
  name: safeStr(200),
  type: z.enum(['god', 'demigod', 'spirit', 'creature', 'civilization', 'artifact', 'realm', 'concept']).default('creature'),
  power: cInt(0, 100, 10),
  loyalty: cInt(-100, 100, 0),
  status: z.enum(['active', 'dormant', 'destroyed', 'unknown']).default('active'),
  description: safeStr(500),
  properties: z.record(z.string(), safeStr(300)).default({}),
});

// ── Quest Schema ──

export const QuestObjectiveSchema = z.object({
  description: safeStr(300),
  done: z.boolean().default(false),
});

export const QuestSchema = z.object({
  title: safeStr(200),
  type: z.enum(['main', 'side', 'divine', 'political', 'personal']).default('side'),
  status: z.enum(['pending', 'active', 'completed', 'failed']).default('pending'),
  objectives: z.array(QuestObjectiveSchema).default([]),
  reward: safeStr(300),
  deadlineTurn: z.number().int().optional(),
});

// ── Core Stat Data Schema ──

export const StatDataSchema = z.object({
  // Identity
  path: z.enum(['creator', 'god', 'mortal']).default('creator'),
  name: safeStr(200),
  title: safeStr(200),
  age: z.number().optional(),

  // Attributes
  attributes: z.record(z.string(), z.number()).default({}),
  _derived: z.record(z.string(), z.number()).default({}),

  // Traits
  traits: z.array(safeStr(200)).default([]),
  abilities: z.record(z.string(), z.object({
    level: cInt(0, 100, 1),
    description: safeStr(300),
  })).default({}),

  // Resources
  resources: z.object({
    power: cInt(0, 99999, 100),
    followers: cInt(0, 99999999, 0),
    wealth: cInt(0, 99999999, 0),
    faith: cInt(0, 100, 0),
    karma: cInt(-100, 100, 0),
    progress: cInt(0, 9999999, 0),
  }).default(() => ({ power: 100, followers: 0, wealth: 0, faith: 0, karma: 0, progress: 0 })),

  // World State
  world: z.object({
    era: safeStr(200),
    eraDescription: safeStr(500),
    region: safeStr(200),
    faction: safeStr(200),
    cosmicDomain: safeStr(200),
    divineRealm: safeStr(200),
    mortalOrigin: safeStr(200),
    mortalClass: safeStr(200),
    reputation: safeStr(200),
    crisis: safeStr(300),
    cosmicRules: safeStr(500),
    pantheonName: safeStr(200),
    appearance: safeStr(300),
  }).default(() => ({
    era: '', eraDescription: '', region: '', faction: '',
    cosmicDomain: '', divineRealm: '', mortalOrigin: '', mortalClass: '',
    reputation: '', crisis: '', cosmicRules: '', pantheonName: '', appearance: '',
  })),

  // NPCs
  npcs: z.record(z.string(), NpcSchema).default({}),

  // Entities
  entities: z.record(z.string(), EntitySchema).default({}),

  // Quests
  quests: z.record(z.string(), QuestSchema).default({}),

  // Companion
  companion: z.object({
    name: safeStr(200),
    description: safeStr(300),
    attributes: z.record(z.string(), z.number()).default({}),
  }).default(() => ({ name: '', description: '', attributes: {} })),

  // Timeline
  timeline: z.array(z.object({
    turn: z.number().int().default(0),
    event: safeStr(500),
    category: z.enum(['creation', 'combat', 'diplomacy', 'divine', 'personal', 'world']).default('world'),
  })).default([]),

  // Settings
  settings: z.object({
    difficulty: z.enum(['easy', 'balanced', 'realistic']).default('balanced'),
    narrativeMode: z.enum(['guided', 'freeform']).default('freeform'),
    playerCentric: z.boolean().default(true),
    narrativeStyle: z.enum(['epic', 'dark', 'romantic', 'humorous', 'gritty', 'poetic']).default('epic'),
    responseLength: z.enum(['short', 'medium', 'long']).default('medium'),
    maturity: z.enum(['safe', 'mature']).default('safe'),
    pacing: z.enum(['slow', 'normal', 'fast']).default('normal'),
  }).default(() => ({
    difficulty: 'balanced' as const, narrativeMode: 'freeform' as const, playerCentric: true,
    narrativeStyle: 'epic' as const, responseLength: 'medium' as const, maturity: 'safe' as const, pacing: 'normal' as const,
  })),

  // Engine readonly
  _turnCount: z.number().int().default(0),
  _seed: z.number().int().default(0),
  _version: z.number().int().default(1),
}).default(() => ({
  path: 'creator' as const,
  name: '', title: '',
  attributes: {}, _derived: {},
  traits: [],
  abilities: {},
  resources: { power: 100, followers: 0, wealth: 0, faith: 0, karma: 0, progress: 0 },
  world: {
    era: '', eraDescription: '', region: '', faction: '',
    cosmicDomain: '', divineRealm: '', mortalOrigin: '', mortalClass: '',
    reputation: '', crisis: '', cosmicRules: '', pantheonName: '', appearance: '',
  },
  npcs: {}, entities: {}, quests: {},
  companion: { name: '', description: '', attributes: {} },
  timeline: [],
  settings: {
    difficulty: 'balanced' as const, narrativeMode: 'freeform' as const, playerCentric: true,
    narrativeStyle: 'epic' as const, responseLength: 'medium' as const, maturity: 'safe' as const, pacing: 'normal' as const,
  },
  _turnCount: 0, _seed: 0, _version: 1,
}));

export type StatData = z.infer<typeof StatDataSchema>;
export type NpcData = z.infer<typeof NpcSchema>;
export type EntityData = z.infer<typeof EntitySchema>;
export type QuestData = z.infer<typeof QuestSchema>;
