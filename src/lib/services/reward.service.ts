import {
  STREAK_REWARD_INTERVAL,
  LEVEL_CUSTOM_REWARD_INTERVAL,
} from "@/lib/constants";
import type { RewardType } from "@/lib/types";

// ─── Reward Eligibility ───────────────────────────────────────────────────────

/**
 * Determine the streak milestones that should generate new reward slots
 * given a new streak value.
 *
 * Returns the milestone (e.g. 10, 20, 30) if a reward should be created,
 * or null if not.
 */
export function streakRewardMilestone(newStreak: number): number | null {
  if (newStreak > 0 && newStreak % STREAK_REWARD_INTERVAL === 0) {
    return newStreak;
  }
  return null;
}

/**
 * Determine if leveling up to `newLevel` should create a custom reward slot.
 */
export function levelCustomRewardMilestone(newLevel: number): number | null {
  if (newLevel > 0 && newLevel % LEVEL_CUSTOM_REWARD_INTERVAL === 0) {
    return newLevel;
  }
  return null;
}

// ─── Reward Description Helpers ───────────────────────────────────────────────

export function defaultStreakRewardDescription(milestone: number): string {
  return `🔥 ${milestone}-day streak reward`;
}

export function defaultLevelRewardDescription(level: number): string {
  return `⭐ Level ${level} milestone reward`;
}

// ─── Reward Type Helpers ──────────────────────────────────────────────────────

export function isStreakReward(type: RewardType): boolean {
  return type === "streak";
}

export function isLevelMilestoneReward(type: RewardType): boolean {
  return type === "level_milestone";
}
