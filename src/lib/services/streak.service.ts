import { STREAK_REWARD_INTERVAL } from "@/lib/constants";
import { format, parseISO, differenceInCalendarDays, isValid } from "date-fns";

/**
 * Format a Date object to YYYY-MM-DD string.
 */
export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Get today's date as a YYYY-MM-DD string.
 */
export function todayString(): string {
  return toDateString(new Date());
}

/**
 * Determine if a date string is today.
 */
export function isToday(dateStr: string): boolean {
  return dateStr === todayString();
}

/**
 * Determine if a date string is in the past (before today).
 */
export function isPast(dateStr: string): boolean {
  return dateStr < todayString();
}

/**
 * Calculate the new streak after a day's tasks are all completed.
 *
 * Rules:
 * - If lastCompletedDate was yesterday → increment streak
 * - If lastCompletedDate was today (already updated) → no change
 * - If there's a gap → reset streak to 1
 * - If no previous completion → start at 1
 *
 * @param lastCompletedDate - "YYYY-MM-DD" string or null
 * @param today             - "YYYY-MM-DD" string (defaults to actual today)
 */
export function calculateNewStreak(
  currentStreak: number,
  lastCompletedDate: string | null,
  today: string = todayString(),
): { newStreak: number; streakUpdated: boolean } {
  if (!lastCompletedDate) {
    return { newStreak: 1, streakUpdated: true };
  }

  // Edge case: already updated today
  if (lastCompletedDate === today) {
    return { newStreak: currentStreak, streakUpdated: false };
  }

  const last = parseISO(lastCompletedDate);
  const current = parseISO(today);

  if (!isValid(last) || !isValid(current)) {
    return { newStreak: 1, streakUpdated: true };
  }

  const dayDiff = differenceInCalendarDays(current, last);

  if (dayDiff === 1) {
    // Consecutive day
    return { newStreak: currentStreak + 1, streakUpdated: true };
  }

  // Gap → reset
  return { newStreak: 1, streakUpdated: true };
}

/**
 * Determine if a streak count unlocks a reward.
 * A reward is unlocked every STREAK_REWARD_INTERVAL streaks (10, 20, 30 ...).
 */
export function streakUnlocksReward(streak: number): boolean {
  return streak > 0 && streak % STREAK_REWARD_INTERVAL === 0;
}

/**
 * Check if a task date has passed midnight (should be marked failed).
 */
export function taskIsOverdue(
  taskDate: string,
  now: string = todayString(),
): boolean {
  return taskDate < now;
}
