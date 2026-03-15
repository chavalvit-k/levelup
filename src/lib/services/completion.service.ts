import { prisma } from "@/lib/db/prisma";
import type { PrismaClient } from "@/generated/prisma/client";
import { calculateTaskXp } from "@/lib/services/xp.service";
import { processXpGain, xpWithinLevel } from "@/lib/services/level.service";
import { calculateNewStreak, todayString } from "@/lib/services/streak.service";
import { streakRewardMilestone } from "@/lib/services/reward.service";
import type { DailyTask, TaskCompletionResult } from "@/lib/types";
import {
  DEFAULT_USER_ID,
  SLIME_COLOR_PALETTE,
  BACKGROUND_COLOR_PALETTE,
  DEFAULT_COSMETIC_COLORS,
} from "@/lib/constants";

/**
 * Complete a daily task atomically.
 *
 * This is the core game engine. It:
 * 1. Marks the task as done
 * 2. Calculates XP (base + hero bonus + daily completion bonus)
 * 3. Processes level ups and cosmetic/reward unlocks
 * 4. Updates streak if all tasks for the day are now done
 * 5. Creates any unlocked reward records
 *
 * All DB writes happen in a single transaction.
 */
export async function completeTask(
  taskId: string,
): Promise<TaskCompletionResult> {
  // Load task + user + all tasks for the same day
  const [task, user] = await Promise.all([
    prisma.dailyTask.findUniqueOrThrow({
      where: { id: taskId },
      include: { subtasks: true },
    }),
    prisma.user.findUniqueOrThrow({ where: { id: DEFAULT_USER_ID } }),
  ]);

  if (task.status === "done") {
    throw new Error("Task is already completed.");
  }
  if (task.status === "failed") {
    throw new Error("Cannot complete a failed task.");
  }

  const today = todayString();

  // Get all other tasks on the same date (excluding this one)
  const otherTasksForDay = await prisma.dailyTask.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      date: task.date,
      id: { not: taskId },
    },
  });

  // After completing this task, will all tasks for the day be done?
  const allOthersDone = otherTasksForDay.every(
    (t: { status: string }) => t.status === "done",
  );
  const willAllBeDone = allOthersDone && otherTasksForDay.length >= 0; // this task is about to be done

  // Sum XP already earned by completed tasks today (base + hero bonuses already stored in xpEarned)
  const xpAlreadyEarned = otherTasksForDay
    .filter((t: { status: string }) => t.status === "done")
    .reduce((sum: number, t: { xpEarned: number }) => sum + t.xpEarned, 0);

  // Calculate XP for this task
  const xpResult = calculateTaskXp(
    task.difficulty as import("@/lib/types").Difficulty,
    task.isHeroTask,
    willAllBeDone,
    xpAlreadyEarned,
  );

  const xpToAdd = xpResult.totalXp;
  const newTotalXp = user.totalXp + xpToAdd;

  // Level up processing
  const levelUpResult = processXpGain(user.level, user.totalXp, xpToAdd);
  const newLevel = levelUpResult ? levelUpResult.newLevel : user.level;
  const newXp = xpWithinLevel(newTotalXp);

  // Streak processing — only update if all tasks for today are done
  let newStreak = user.streak;
  let streakUpdated = false;
  if (willAllBeDone && task.date === today) {
    const streakResult = calculateNewStreak(
      user.streak,
      user.lastCompletedDate,
      today,
    );
    newStreak = streakResult.newStreak;
    streakUpdated = streakResult.streakUpdated;
  }

  const longestStreak = Math.max(user.longestStreak, newStreak);

  // Rewards to create
  const rewardsToCreate: Array<{
    type: string;
    milestone: number;
    description: string;
  }> = [];

  if (levelUpResult) {
    // Cosmetic reward per level
    if (levelUpResult.cosmeticUnlocked) {
      rewardsToCreate.push({
        type: "level_milestone",
        milestone: newLevel,
        description: `⭐ Level ${newLevel} cosmetic unlocked: ${levelUpResult.cosmeticUnlocked}`,
      });
    }
    // Custom reward slot every 5 levels
    if (levelUpResult.customRewardUnlocked) {
      rewardsToCreate.push({
        type: "level_milestone",
        milestone: newLevel,
        description: `🎁 Level ${newLevel} milestone reward`,
      });
    }
  }

  if (streakUpdated) {
    const streakMilestone = streakRewardMilestone(newStreak);
    if (streakMilestone !== null) {
      rewardsToCreate.push({
        type: "streak",
        milestone: streakMilestone,
        description: `🔥 ${streakMilestone}-day streak reward`,
      });
    }
  }

  // ─── Atomic DB Transaction ─────────────────────────────────────────────────

  const [updatedTask] = await prisma.$transaction(
    async (
      tx: Omit<
        PrismaClient,
        "$connect" | "$disconnect" | "$on" | "$use" | "$extends"
      >,
    ) => {
      // Mark task done
      const doneTask = await tx.dailyTask.update({
        where: { id: taskId },
        data: {
          status: "done",
          xpEarned: xpToAdd,
          completedAt: new Date(),
        },
        include: { subtasks: true },
      });

      // Update user
      await tx.user.update({
        where: { id: DEFAULT_USER_ID },
        data: {
          level: newLevel,
          xp: newXp,
          totalXp: newTotalXp,
          streak: newStreak,
          longestStreak,
          ...(streakUpdated && task.date === today
            ? { lastCompletedDate: today }
            : {}),
        },
      });

      // Create cosmetic if level up
      if (levelUpResult?.cosmeticUnlocked) {
        const slot = levelUpResult.cosmeticUnlocked;
        let cosmeticColor = DEFAULT_COSMETIC_COLORS[slot] ?? "#6366F1";
        if (slot === "color") {
          cosmeticColor = SLIME_COLOR_PALETTE[newLevel] ?? "#22C55E";
        } else if (slot === "background") {
          cosmeticColor = BACKGROUND_COLOR_PALETTE[newLevel] ?? "#0F2942";
        }
        await tx.cosmeticItem.create({
          data: {
            userId: DEFAULT_USER_ID,
            slot,
            color: cosmeticColor,
            unlockedAt: newLevel,
          },
        });
      }

      // Create reward records
      for (const reward of rewardsToCreate) {
        await tx.reward.create({
          data: { userId: DEFAULT_USER_ID, ...reward },
        });
      }

      return [doneTask];
    },
  );

  return {
    task: { ...updatedTask, subtasks: updatedTask.subtasks } as DailyTask,
    xpResult,
    levelUpResult,
    streakUpdated,
    newStreak,
    rewardUnlocked: rewardsToCreate.length > 0,
  };
}

/**
 * Rollover pending tasks from past dates to "failed" status.
 * Should be called on app load / date change detection.
 */
export async function rolloverFailedTasks(): Promise<number> {
  const today = todayString();
  const result = await prisma.dailyTask.updateMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: "pending",
      date: { lt: today },
    },
    data: { status: "failed" },
  });
  return result.count;
}
