import { prisma, ensureDefaultUser } from "@/lib/db/prisma";
import { DEFAULT_USER_ID } from "@/lib/constants";
import {
  startOfWeek,
  startOfMonth,
  startOfYear,
  format,
  subDays,
} from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskStats {
  allTime: { completed: number; missed: number };
  thisYear: { completed: number; missed: number };
  thisMonth: { completed: number; missed: number };
  thisWeek: { completed: number; missed: number };
}

export interface RewardStats {
  totalUnlocked: number;
  totalClaimed: number;
}

export interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number; // tasks completed
}

export interface DashboardStats {
  tasks: TaskStats;
  rewards: RewardStats;
  heatmap: HeatmapDay[];
  avgTasksPerDay: number;
  completionRate: number; // 0-100
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateString(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

async function countTasks(whereExtra: object): Promise<number> {
  return prisma.dailyTask.count({
    where: { userId: DEFAULT_USER_ID, ...whereExtra },
  });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getTaskStats(): Promise<TaskStats> {
  await ensureDefaultUser();
  const now = new Date();
  const weekStart = toDateString(startOfWeek(now, { weekStartsOn: 1 }));
  const monthStart = toDateString(startOfMonth(now));
  const yearStart = toDateString(startOfYear(now));

  const [
    allDone,
    allFailed,
    yearDone,
    yearFailed,
    monthDone,
    monthFailed,
    weekDone,
    weekFailed,
  ] = await Promise.all([
    countTasks({ status: "done" }),
    countTasks({ status: "failed" }),
    countTasks({ status: "done", date: { gte: yearStart } }),
    countTasks({ status: "failed", date: { gte: yearStart } }),
    countTasks({ status: "done", date: { gte: monthStart } }),
    countTasks({ status: "failed", date: { gte: monthStart } }),
    countTasks({ status: "done", date: { gte: weekStart } }),
    countTasks({ status: "failed", date: { gte: weekStart } }),
  ]);

  return {
    allTime: { completed: allDone, missed: allFailed },
    thisYear: { completed: yearDone, missed: yearFailed },
    thisMonth: { completed: monthDone, missed: monthFailed },
    thisWeek: { completed: weekDone, missed: weekFailed },
  };
}

export async function getRewardStats(): Promise<RewardStats> {
  await ensureDefaultUser();
  const [totalUnlocked, totalClaimed] = await Promise.all([
    prisma.reward.count({ where: { userId: DEFAULT_USER_ID } }),
    prisma.reward.count({ where: { userId: DEFAULT_USER_ID, claimed: true } }),
  ]);
  return { totalUnlocked, totalClaimed };
}

export async function getHeatmapData(daysBack = 365): Promise<HeatmapDay[]> {
  await ensureDefaultUser();
  const today = new Date();
  const startDate = toDateString(subDays(today, daysBack - 1));

  // Fetch all completed tasks within the range
  const tasks = await prisma.dailyTask.findMany({
    where: {
      userId: DEFAULT_USER_ID,
      status: "done",
      date: { gte: startDate },
    },
    select: { date: true },
  });

  // Aggregate counts by date
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    counts[t.date] = (counts[t.date] ?? 0) + 1;
  }

  // Build full range (0 even on empty days)
  const result: HeatmapDay[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = toDateString(subDays(today, i));
    result.push({ date: d, count: counts[d] ?? 0 });
  }

  return result;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [tasks, rewards, heatmap] = await Promise.all([
    getTaskStats(),
    getRewardStats(),
    getHeatmapData(365),
  ]);

  // Average tasks per day (based on days with at least 1 task)
  const activeDays = heatmap.filter((d) => d.count > 0).length;
  const avgTasksPerDay =
    activeDays > 0 ? Math.round(tasks.allTime.completed / activeDays) : 0;

  // Overall completion rate (done / (done + failed))
  const total = tasks.allTime.completed + tasks.allTime.missed;
  const completionRate =
    total > 0 ? Math.round((tasks.allTime.completed / total) * 100) : 0;

  return { tasks, rewards, heatmap, avgTasksPerDay, completionRate };
}
