// ─── XP & Level Constants ────────────────────────────────────────────────────

export const XP_PER_LEVEL = 500;
export const MAX_LEVEL = 30;

export const DIFFICULTY_XP = {
  trivial: 5,
  standard: 10,
  challenging: 15,
  heroic: 20,
} as const;

export const HERO_TASK_BONUS_XP = 10;
export const DAILY_COMPLETION_BONUS_PERCENT = 0.2; // 20%

// ─── Streak Constants ─────────────────────────────────────────────────────────

export const STREAK_REWARD_INTERVAL = 10; // every 10 streaks

// ─── Level Milestone Constants ────────────────────────────────────────────────

export const LEVEL_COSMETIC_INTERVAL = 1; // every level → cosmetic
export const LEVEL_CUSTOM_REWARD_INTERVAL = 5; // every 5 levels → custom reward slot

// ─── Cosmetic Slot Rotation ───────────────────────────────────────────────────
// 5-level reward cycle:
//   Level N % 5 === 1 → color   (new slime body colour)
//   Level N % 5 === 2 → glasses
//   Level N % 5 === 3 → hat
//   Level N % 5 === 4 → background
//   Level N % 5 === 0 → custom reward slot (every 5 levels)

export const COSMETIC_SLOTS = [
  "color",
  "glasses",
  "hat",
  "background",
] as const;

// ─── Slime Colour Palette ─────────────────────────────────────────────────────
// Unlock order: levels 1, 6, 11, 16, 21, 26
export const SLIME_COLOR_PALETTE: Record<number, string> = {
  1: "#22C55E", // forest green
  6: "#EF4444", // crimson
  11: "#F59E0B", // amber
  16: "#EC4899", // pink
  21: "#8B5CF6", // violet
  26: "#06B6D4", // cyan
};

// ─── Background Palette ───────────────────────────────────────────────────────
// Unlock order: levels 4, 9, 14, 19, 24, 29
export const BACKGROUND_COLOR_PALETTE: Record<number, string> = {
  4: "#0F2942", // night sky
  9: "#0D2B1A", // dark forest
  14: "#1E1B4B", // deep space
  19: "#1A1A2E", // midnight
  24: "#2D1A0E", // scorched earth
  29: "#0D2929", // deep ocean
};

// ─── Default cosmetic colours per slot ───────────────────────────────────────
export const DEFAULT_COSMETIC_COLORS: Record<string, string> = {
  glasses: "#38BDF8",
  hat: "#818CF8",
};

// ─── Task Difficulty Options ──────────────────────────────────────────────────

export const DIFFICULTIES = [
  "trivial",
  "standard",
  "challenging",
  "heroic",
] as const;

// ─── Task Type Options ────────────────────────────────────────────────────────

export const TASK_TYPES = ["timed", "non_timed"] as const;

// ─── Task Status Options ──────────────────────────────────────────────────────

export const TASK_STATUSES = ["pending", "done", "failed"] as const;

// ─── General Task Priority Options ────────────────────────────────────────────

export const PRIORITIES = ["low", "medium", "high", "urgent"] as const;

// ─── Reward Types ─────────────────────────────────────────────────────────────

export const REWARD_TYPES = ["streak", "level_milestone"] as const;

// ─── Colors ───────────────────────────────────────────────────────────────────

export const COLORS = {
  primary: "#6366F1",
  xp: "#F59E0B",
  success: "#22C55E",
  failure: "#EF4444",
  streak: "#FB923C",
  background: "#0F172A",
  card: "#111827",
  border: "#1F2937",
  text: "#E5E7EB",
} as const;

// ─── Default User ID ──────────────────────────────────────────────────────────

export const DEFAULT_USER_ID = "default_user";
