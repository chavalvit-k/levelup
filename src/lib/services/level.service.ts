import {
  XP_PER_LEVEL,
  MAX_LEVEL,
  COSMETIC_SLOTS,
  LEVEL_CUSTOM_REWARD_INTERVAL,
} from "@/lib/constants";
import type { CosmeticSlot, LevelUpResult } from "@/lib/types";

/**
 * Get the total XP required to reach a given level from level 0.
 */
export function totalXpForLevel(level: number): number {
  return level * XP_PER_LEVEL;
}

/**
 * Calculate the level for a given cumulative totalXp value.
 */
export function levelFromTotalXp(totalXp: number): number {
  const level = Math.floor(totalXp / XP_PER_LEVEL);
  return Math.min(level, MAX_LEVEL);
}

/**
 * Calculate XP within the current level (0 to XP_PER_LEVEL - 1).
 */
export function xpWithinLevel(totalXp: number): number {
  const level = levelFromTotalXp(totalXp);
  if (level >= MAX_LEVEL) return XP_PER_LEVEL; // capped
  return totalXp - level * XP_PER_LEVEL;
}

/**
 * XP progress as a percentage within the current level (0–100).
 */
export function xpProgressPercent(totalXp: number): number {
  const level = levelFromTotalXp(totalXp);
  if (level >= MAX_LEVEL) return 100;
  const withinLevel = xpWithinLevel(totalXp);
  return Math.min(100, Math.round((withinLevel / XP_PER_LEVEL) * 100));
}

/**
 * XP remaining to reach the next level.
 */
export function xpToNextLevel(totalXp: number): number {
  const level = levelFromTotalXp(totalXp);
  if (level >= MAX_LEVEL) return 0;
  return (level + 1) * XP_PER_LEVEL - totalXp;
}

/**
 * Determine which cosmetic slot to award for a given level.
 *
 * 5-level cycle:
 *   % 5 === 1 → color   (new slime body colour)
 *   % 5 === 2 → glasses
 *   % 5 === 3 → hat
 *   % 5 === 4 → background
 *   % 5 === 0 → null (custom reward slot handled by isCustomRewardLevel)
 */
export function cosmeticSlotForLevel(level: number): CosmeticSlot | null {
  if (level % LEVEL_CUSTOM_REWARD_INTERVAL === 0) return null;
  const index = (level % LEVEL_CUSTOM_REWARD_INTERVAL) - 1; // 0–3
  return COSMETIC_SLOTS[index];
}

/**
 * Determine if a level unlock grants a custom reward slot (every 5 levels).
 */
export function isCustomRewardLevel(level: number): boolean {
  return level > 0 && level % LEVEL_CUSTOM_REWARD_INTERVAL === 0;
}

/**
 * Process gaining XP: compute new level, XP within level, cosmetic/reward unlocks.
 *
 * Returns a LevelUpResult if any levels were gained, otherwise null.
 */
export function processXpGain(
  currentLevel: number,
  currentTotalXp: number,
  xpToAdd: number,
): LevelUpResult | null {
  const newTotalXp = currentTotalXp + xpToAdd;
  const newLevel = Math.min(levelFromTotalXp(newTotalXp), MAX_LEVEL);
  const levelsGained = newLevel - currentLevel;

  if (levelsGained === 0) return null;

  // Award cosmetic for the first new level gained
  const cosmeticUnlocked: CosmeticSlot | null =
    newLevel <= MAX_LEVEL ? cosmeticSlotForLevel(newLevel) : null;

  const customRewardUnlocked = isCustomRewardLevel(newLevel);

  return {
    levelsGained,
    newLevel,
    newXp: xpWithinLevel(newTotalXp),
    newTotalXp,
    cosmeticUnlocked,
    customRewardUnlocked,
  };
}
