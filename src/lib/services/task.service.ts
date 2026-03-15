import type { DailyTask, Difficulty } from "@/lib/types";
import { todayString, isPast } from "@/lib/services/streak.service";

// ─── Task Validation ──────────────────────────────────────────────────────────

/**
 * A task can be set as the Hero Task only if its difficulty is standard or higher.
 */
export function isEligibleForHeroTask(difficulty: Difficulty): boolean {
  return (
    difficulty === "standard" ||
    difficulty === "challenging" ||
    difficulty === "heroic"
  );
}

/**
 * Check whether a daily list can have this task as its Hero Task.
 * Only one hero task allowed per day, and difficulty must be standard+.
 */
export function validateHeroTask(
  task: { difficulty: Difficulty },
  existingHeroTaskId: string | null,
  thisTaskId: string,
): { valid: boolean; reason?: string } {
  if (!isEligibleForHeroTask(task.difficulty)) {
    return {
      valid: false,
      reason: "Hero task must be Standard difficulty or higher.",
    };
  }
  if (existingHeroTaskId && existingHeroTaskId !== thisTaskId) {
    return {
      valid: false,
      reason: "A hero task already exists for this day.",
    };
  }
  return { valid: true };
}

// ─── Task Completion Eligibility ─────────────────────────────────────────────

/**
 * Check if a timed task is eligible for timer-based auto-completion.
 * The task is considered "timer-done" when elapsed >= required duration.
 */
export function isTimerComplete(
  taskType: string,
  elapsedTime: number,
  requiredDuration: number | null,
): boolean {
  if (taskType !== "timed") return false;
  if (requiredDuration === null) return false;
  return elapsedTime >= requiredDuration;
}

// ─── Midnight Rollover ────────────────────────────────────────────────────────

/**
 * Determine which tasks should be marked as "failed" due to a date change.
 * A pending task whose date is in the past should be marked failed.
 */
export function getPendingOverdueTasks(
  tasks: DailyTask[],
  today: string = todayString(),
): DailyTask[] {
  return tasks.filter(
    (t) => t.status === "pending" && isPast(t.date) && t.date < today,
  );
}

// ─── Daily Completion Check ───────────────────────────────────────────────────

/**
 * Check whether all tasks for a given date are completed.
 */
export function areAllTasksDone(tasks: DailyTask[]): boolean {
  if (tasks.length === 0) return false;
  return tasks.every((t) => t.status === "done");
}

/**
 * Get the total base XP + hero bonuses for a set of completed daily tasks,
 * not including the daily completion bonus.
 */
export function sumCompletedTasksXp(tasks: DailyTask[]): number {
  return tasks
    .filter((t) => t.status === "done")
    .reduce((sum, t) => sum + t.xpEarned, 0);
}

// ─── Date Validation ─────────────────────────────────────────────────────────

/**
 * Validate the date a new task is being created for.
 * Tasks can only be created for today or future dates.
 */
export function validateTaskDate(
  date: string,
  today: string = todayString(),
): { valid: boolean; reason?: string } {
  if (date < today) {
    return { valid: false, reason: "Cannot create tasks for past dates." };
  }
  return { valid: true };
}

/**
 * Check whether the user needs to clear previous day tasks before
 * they can create new tasks for tomorrow or beyond.
 *
 * Rule: User must clear (resolve) the previous day's tasks first.
 */
export function hasPendingPastTasks(
  tasks: DailyTask[],
  today: string = todayString(),
): boolean {
  return tasks.some((t) => t.status === "pending" && t.date < today);
}
