import {
  DIFFICULTY_XP,
  HERO_TASK_BONUS_XP,
  DAILY_COMPLETION_BONUS_PERCENT,
} from "@/lib/constants";
import type { Difficulty, XpResult } from "@/lib/types";

/**
 * Calculate the XP earned for completing a single daily task.
 *
 * @param difficulty   - Task difficulty level
 * @param isHeroTask   - Whether this task is the hero task
 * @param allCompleted - Whether all tasks for the day are completed (daily bonus)
 * @param totalDayXp   - Total XP earned from other tasks today (for daily bonus calc)
 */
export function calculateTaskXp(
  difficulty: Difficulty,
  isHeroTask: boolean,
  allCompleted: boolean,
  totalDayXpBeforeThis: number,
): XpResult {
  const baseXp = DIFFICULTY_XP[difficulty];
  const heroBonusXp = isHeroTask ? HERO_TASK_BONUS_XP : 0;

  // Daily completion bonus is 20% of ALL XP earned today (including this task)
  const xpBeforeBonus = totalDayXpBeforeThis + baseXp + heroBonusXp;
  const dailyCompletionBonusXp = allCompleted
    ? Math.round(xpBeforeBonus * DAILY_COMPLETION_BONUS_PERCENT)
    : 0;

  return {
    baseXp,
    heroBonusXp,
    dailyCompletionBonusXp,
    totalXp: baseXp + heroBonusXp + dailyCompletionBonusXp,
  };
}

/**
 * Calculate the daily completion bonus XP given the total day XP.
 * Used when ALL tasks are done at once (e.g. importing state).
 */
export function calculateDailyCompletionBonus(totalDayXp: number): number {
  return Math.round(totalDayXp * DAILY_COMPLETION_BONUS_PERCENT);
}

/**
 * Sum the base XP from a list of difficulty/heroTask pairs.
 */
export function sumDayXp(
  tasks: Array<{ difficulty: Difficulty; isHeroTask: boolean }>,
): number {
  return tasks.reduce((sum, t) => {
    return (
      sum +
      DIFFICULTY_XP[t.difficulty] +
      (t.isHeroTask ? HERO_TASK_BONUS_XP : 0)
    );
  }, 0);
}
