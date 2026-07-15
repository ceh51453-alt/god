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

// ── World Time (đồng hồ in-world do Engine sở hữu) ──

export const defaultTime = () => ({
  calendarName: '', cycleRule: '', epochLabel: '', seasonNames: [] as string[],
  daysPerSeason: 30, seasonsPerYear: 4, day: 0, season: 0, year: 0, epoch: 0,
});

export const TimeSchema = z.object({
  calendarName: safeStr(120),
  cycleRule: safeStr(300),
  epochLabel: safeStr(120),
  seasonNames: z.array(safeStr(60)).default([]),
  daysPerSeason: cInt(1, 100000000, 30),
  seasonsPerYear: cInt(1, 100000000, 4),
  day: cInt(0, 1000000000, 0),
  season: cInt(0, 1000000000, 0),
  year: cInt(0, 1000000000, 0),
  epoch: cInt(0, 1000000000, 0),
}).default(defaultTime);

export type WorldTimeData = z.infer<typeof TimeSchema>;

// ── NPC Schema ──

export const NpcSchema = z.object({
  // Định danh & Chân dung
  name: safeStr(200),
  title: safeStr(200),
  aliases: z.array(safeStr(120)).default([]),
  role: safeStr(200),
  alive: z.boolean().default(true),
  causeOfDeath: safeStr(200).optional(),
  age: z.number().int().optional(),
  lifeStage: z.enum(['Ấu Nhi', 'Thiếu Niên', 'Thanh Niên', 'Trưởng Thành', 'Trung Niên', 'Lão Niên']).default('Trưởng Thành'),

  // Quan hệ
  affinity: cInt(-100, 100, 0),
  _affinityStage: AffinityStage.default('Trung Lập'),
  trust: cInt(-100, 100, 0),
  relationshipTypes: z.array(z.enum([
    'Đồng Minh', 'Kẻ Thù', 'Bằng Hữu', 'Cấp Trên', 'Thuộc Hạ', 'Người Thân',
    'Vợ/Chồng', 'Hôn Ước', 'Tình Nhân', 'Đối Thủ', 'Ân Nhân', 'Con Nợ', 'Thầy', 'Trò', 'Không Rõ'
  ])).default([]),
  evaluation: safeStr(300), // Lời đánh giá ngắn của AI về NPC này
  loyalty: cInt(-100, 100, 50),

  // Tính cách & Mục tiêu
  personalityAxes: z.object({
    goodEvil: cInt(-100, 100, 0),
    braveCoward: cInt(-100, 100, 0),
    loyalTreacherous: cInt(-100, 100, 0),
    calmHot: cInt(-100, 100, 0),
  }).default({ goodEvil: 0, braveCoward: 0, loyalTreacherous: 0, calmHot: 0 }),
  personalityTraits: z.array(safeStr(100)).default([]), // Các nét tính cách (tag)
  characterArc: safeStr(300).optional(),
  agenda: safeStr(300), // Mưu cầu/Mục tiêu riêng

  // Ký ức & Tri thức
  memories: z.array(z.object({
    turn: z.number().int(),
    event: safeStr(300),
    emotion: z.enum(['Biết Ơn', 'Oán Hận', 'Ngưỡng Mộ', 'Sợ Hãi', 'Khinh Thường', 'Yêu Mến', 'Ghen Tị', 'Trung Lập']).default('Trung Lập'),
    weight: cInt(0, 100, 50),
  })).default([]),
  unkeptPromises: z.array(safeStr(300)).default([]),
  knows: z.array(safeStr(300)).default([]),
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
  aliases: z.array(safeStr(120)).default([]),
});

// ── Quest Schema ──

export const QuestObjectiveSchema = z.object({
  description: safeStr(300),
  done: z.boolean().default(false),
});

export const QuestSchema = z.object({
  title: safeStr(200),
  type: z.enum(['main', 'side', 'divine', 'political', 'personal']).default('side'),
  rank: z.enum(['SSS', 'SS', 'S', 'A', 'B', 'C', 'D', 'E', 'F']).optional(),
  status: z.enum(['pending', 'active', 'completed', 'failed']).default('pending'),
  objectives: z.array(QuestObjectiveSchema).default([]),
  reward: safeStr(300),
  deadlineTurn: z.number().int().optional(),
});

// ── Domain Schema ──

export const EdictSchema = z.object({
  title: safeStr(200),
  type: z.enum(['tax', 'military', 'trade', 'social', 'religious', 'other']).default('other'),
  status: z.enum(['active', 'suspended', 'abolished']).default('active'),
  description: safeStr(500),
  effect: safeStr(300).optional(),
});

export const BuildingSchema = z.object({
  name: safeStr(200),
  type: z.enum(['castle', 'farm', 'market', 'barracks', 'wall', 'port', 'temple', 'academy', 'other']).default('other'),
  level: cInt(1, 100, 1),
  isConstructing: z.boolean().default(false),
  turnsLeft: cInt(0, 100, 0),
});

export const DomainSchema = z.object({
  name: safeStr(200),
  type: z.enum(['city', 'fortress', 'temple', 'planet', 'region', 'cyberspace', 'other']).default('city'),
  size: z.enum(['small', 'medium', 'large', 'massive']).default('medium'),
  prosperity: cInt(0, 100, 50),
  security: cInt(0, 100, 50),
  population: cInt(0, 99999999, 1000),
  loyalty: cInt(0, 100, 50),
  resources: z.object({
    gold: cInt(0, 999999, 0),
    food: cInt(0, 999999, 0),
    wood: cInt(0, 999999, 0),
    stone: cInt(0, 999999, 0),
  }).default(() => ({ gold: 0, food: 0, wood: 0, stone: 0 })),
  buildings: z.record(z.string(), BuildingSchema).default({}),
  edicts: z.record(z.string(), EdictSchema).default({}),
  description: safeStr(500),
});

// ── Army Schema ──

export const ArmySchema = z.object({
  name: safeStr(200),
  type: z.enum(['infantry', 'cavalry', 'fleet', 'airforce', 'demonic', 'robotic', 'other']).default('infantry'),
  size: cInt(0, 9999999, 100),
  morale: cInt(0, 100, 50),
  discipline: cInt(0, 100, 50),
  equipmentLevel: cInt(1, 10, 1),
  commanderId: safeStr(200).optional(),
  status: z.enum(['garrisoned', 'marching', 'fighting', 'routing', 'destroyed']).default('garrisoned'),
  location: safeStr(200).optional(),
});

// ── World Event Schema ──

export const WorldEventSchema = z.object({
  name: safeStr(200),
  urgency: cInt(0, 100, 50),
  impact: safeStr(300),
  status: z.enum(['ongoing', 'resolved', 'failed']).default('ongoing'),
});

// ── Diplomacy & Council ──

export const DiplomacySchema = z.object({
  status: z.enum(['peace', 'war', 'truce', 'alliance', 'vassal']).default('peace'),
  warScore: cInt(-100, 100, 0),
});

export const CouncilPositionSchema = z.object({
  title: safeStr(100),
  holderId: safeStr(200).optional(), // NPC Id
  competence: cInt(0, 100, 50),
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
    calendar: z.object({
      day: cInt(1, 30, 1),
      month: cInt(1, 12, 1),
      year: z.number().int().default(1),
    }).default(() => ({ day: 1, month: 1, year: 1 })),
    era: safeStr(200),
    eraDescription: safeStr(500),
    region: safeStr(200),
    faction: safeStr(200),
    cosmicDomain: safeStr(200),
    divineRealm: safeStr(200),
    mortalOrigin: safeStr(200),
    mortalClass: safeStr(200),
    reputation: safeStr(200),
    activeEvents: z.array(WorldEventSchema).default([]),
    cosmicRules: safeStr(500),
    pantheonName: safeStr(200),
    appearance: safeStr(300),
    time: TimeSchema,
  }).default(() => ({
    calendar: { day: 1, month: 1, year: 1 },
    era: '', eraDescription: '', region: '', faction: '',
    cosmicDomain: '', divineRealm: '', mortalOrigin: '', mortalClass: '',
    reputation: '', activeEvents: [], cosmicRules: '', pantheonName: '', appearance: '',
    time: defaultTime(),
  })),

  // Domains & Armies
  domains: z.record(z.string(), DomainSchema).default({}),
  armies: z.record(z.string(), ArmySchema).default({}),

  // Diplomacy & Council
  diplomacy: z.record(z.string(), DiplomacySchema).default({}),
  council: z.record(z.string(), CouncilPositionSchema).default({}),

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
    /** Mức lộ của sự kiện — quyết định ai được phép biết. */
    visibility: z.enum(['public', 'private', 'secret']).default('public'),
    /** id các NPC đã chứng kiến sự kiện (được phép biết dù không công khai). */
    witnesses: z.array(safeStr(120)).default([]),
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
    calendar: { day: 1, month: 1, year: 1 },
    era: '', eraDescription: '', region: '', faction: '',
    cosmicDomain: '', divineRealm: '', mortalOrigin: '', mortalClass: '',
    reputation: '', activeEvents: [], cosmicRules: '', pantheonName: '', appearance: '',
    time: defaultTime(),
  },
  domains: {}, armies: {},
  diplomacy: {}, council: {},
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
