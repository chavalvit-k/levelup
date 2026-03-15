import type {
  DIFFICULTIES,
  TASK_TYPES,
  TASK_STATUSES,
  PRIORITIES,
  REWARD_TYPES,
  COSMETIC_SLOTS,
} from "@/lib/constants";

// ─── Branded string types ─────────────────────────────────────────────────────

export type Difficulty = (typeof DIFFICULTIES)[number];
export type TaskType = (typeof TASK_TYPES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export type Priority = (typeof PRIORITIES)[number];
export type RewardType = (typeof REWARD_TYPES)[number];
export type CosmeticSlot = (typeof COSMETIC_SLOTS)[number];

// ─── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  level: number;
  xp: number; // XP within current level (0 to XP_PER_LEVEL - 1)
  totalXp: number; // Cumulative all-time XP
  streak: number;
  longestStreak: number;
  lastCompletedDate: string | null; // "YYYY-MM-DD"
  characterColor: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Daily Task ───────────────────────────────────────────────────────────────

export interface DailyTask {
  id: string;
  userId: string;
  title: string;
  date: string; // "YYYY-MM-DD"
  difficulty: Difficulty;
  taskType: TaskType;
  requiredDuration: number | null; // seconds
  elapsedTime: number; // seconds
  status: TaskStatus;
  isHeroTask: boolean;
  xpEarned: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  subtasks: Subtask[];
}

export interface DailyTaskWithSubtasks extends DailyTask {
  subtasks: Subtask[];
}

// ─── Create/Update DTOs ───────────────────────────────────────────────────────

export interface CreateDailyTaskInput {
  title: string;
  date: string;
  difficulty: Difficulty;
  taskType: TaskType;
  requiredDuration?: number;
  isHeroTask?: boolean;
  subtasks?: CreateSubtaskInput[];
}

export interface UpdateDailyTaskInput {
  title?: string;
  date?: string;
  difficulty?: Difficulty;
  taskType?: TaskType;
  requiredDuration?: number | null;
  isHeroTask?: boolean;
}

// ─── Subtask ──────────────────────────────────────────────────────────────────

export interface Subtask {
  id: string;
  dailyTaskId: string;
  title: string;
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubtaskInput {
  title: string;
}

// ─── General Task ─────────────────────────────────────────────────────────────

export interface GeneralTask {
  id: string;
  userId: string;
  title: string;
  priority: Priority;
  deadline: string | null; // "YYYY-MM-DD"
  done: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateGeneralTaskInput {
  title: string;
  priority?: Priority;
  deadline?: string;
}

export interface UpdateGeneralTaskInput {
  title?: string;
  priority?: Priority;
  deadline?: string | null;
  done?: boolean;
}

// ─── Reward ───────────────────────────────────────────────────────────────────

export interface Reward {
  id: string;
  userId: string;
  type: RewardType;
  milestone: number;
  description: string;
  claimed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Cosmetic Item ────────────────────────────────────────────────────────────

export interface CosmeticItem {
  id: string;
  userId: string;
  slot: CosmeticSlot;
  color: string;
  equipped: boolean;
  unlockedAt: number; // level
  createdAt: Date;
  updatedAt: Date;
}

// ─── XP Calculation Result ────────────────────────────────────────────────────

export interface XpResult {
  baseXp: number;
  heroBonusXp: number;
  dailyCompletionBonusXp: number;
  totalXp: number;
}

// ─── Level Up Result ──────────────────────────────────────────────────────────

export interface LevelUpResult {
  levelsGained: number;
  newLevel: number;
  newXp: number; // XP within new level
  newTotalXp: number;
  cosmeticUnlocked: CosmeticSlot | null;
  customRewardUnlocked: boolean; // every 5 levels
}

// ─── Task Completion Result ───────────────────────────────────────────────────

export interface TaskCompletionResult {
  task: DailyTask;
  xpResult: XpResult;
  levelUpResult: LevelUpResult | null;
  streakUpdated: boolean;
  newStreak: number;
  rewardUnlocked: boolean;
}

// ─── Timer State ──────────────────────────────────────────────────────────────

export type TimerMode = "task" | "free";
export type TimerStatus = "idle" | "running" | "paused" | "completed";

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  selectedTaskId: string | null;
  elapsed: number; // seconds
  startedAt: number | null; // timestamp
}

// ─── Dashboard Data ───────────────────────────────────────────────────────────

export interface DashboardData {
  user: User;
  todayTasks: DailyTask[];
  xpEarnedToday: number;
  xpToNextLevel: number;
  xpProgressPercent: number;
  pendingRewards: Reward[];
  equippedCosmetics: CosmeticItem[];
}
