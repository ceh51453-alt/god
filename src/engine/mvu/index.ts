/* MVU Engine — barrel export */
export { StatDataSchema, safeString, clampedStat, clampedInt, deriveAffinityStage } from './schema';
export type { StatData, NpcData, EntityData, QuestData } from './schema';
export { applyPatches, applyPatchOp, filterAIPatches, getAtPath, setAtPath } from './patchEngine';
export type { MvuPatchOp } from './patchEngine';
export { extractPatches } from './extractor';
export type { ExtractionResult } from './extractor';
export { renderStateForAI, buildMvuInstructionPrompt } from './stateRenderer';
export { saveSnapshot, getSnapshot, rollbackTo, clearSnapshots } from './snapshot';
