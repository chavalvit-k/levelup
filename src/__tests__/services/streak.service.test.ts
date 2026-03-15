import { describe, it, expect } from "vitest";
import {
  calculateNewStreak,
  streakUnlocksReward,
  taskIsOverdue,
  toDateString,
} from "@/lib/services/streak.service";

describe("Streak Service", () => {
  describe("calculateNewStreak", () => {
    it("starts streak at 1 when no previous completion", () => {
      const result = calculateNewStreak(0, null, "2026-01-10");
      expect(result.newStreak).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });

    it("increments streak when last completed was yesterday", () => {
      const result = calculateNewStreak(5, "2026-01-09", "2026-01-10");
      expect(result.newStreak).toBe(6);
      expect(result.streakUpdated).toBe(true);
    });

    it("does not update streak if already updated today", () => {
      const result = calculateNewStreak(5, "2026-01-10", "2026-01-10");
      expect(result.newStreak).toBe(5);
      expect(result.streakUpdated).toBe(false);
    });

    it("resets streak to 1 when there is a gap of more than 1 day", () => {
      const result = calculateNewStreak(5, "2026-01-05", "2026-01-10");
      expect(result.newStreak).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });

    it("resets streak to 1 when gap is exactly 2 days", () => {
      const result = calculateNewStreak(3, "2026-01-08", "2026-01-10");
      expect(result.newStreak).toBe(1);
      expect(result.streakUpdated).toBe(true);
    });

    it("handles month boundary correctly", () => {
      // January 31 → February 1
      const result = calculateNewStreak(10, "2026-01-31", "2026-02-01");
      expect(result.newStreak).toBe(11);
      expect(result.streakUpdated).toBe(true);
    });

    it("handles year boundary correctly", () => {
      // December 31 → January 1
      const result = calculateNewStreak(20, "2025-12-31", "2026-01-01");
      expect(result.newStreak).toBe(21);
      expect(result.streakUpdated).toBe(true);
    });
  });

  describe("streakUnlocksReward", () => {
    it("returns true at every 10-streak milestone", () => {
      expect(streakUnlocksReward(10)).toBe(true);
      expect(streakUnlocksReward(20)).toBe(true);
      expect(streakUnlocksReward(30)).toBe(true);
      expect(streakUnlocksReward(100)).toBe(true);
    });

    it("returns false for non-milestone streaks", () => {
      expect(streakUnlocksReward(1)).toBe(false);
      expect(streakUnlocksReward(5)).toBe(false);
      expect(streakUnlocksReward(11)).toBe(false);
      expect(streakUnlocksReward(25)).toBe(false);
    });

    it("returns false for 0", () => {
      expect(streakUnlocksReward(0)).toBe(false);
    });
  });

  describe("taskIsOverdue", () => {
    it("returns true when task date is before today", () => {
      expect(taskIsOverdue("2026-01-01", "2026-01-10")).toBe(true);
    });

    it("returns false when task date equals today", () => {
      expect(taskIsOverdue("2026-01-10", "2026-01-10")).toBe(false);
    });

    it("returns false when task date is in the future", () => {
      expect(taskIsOverdue("2026-01-20", "2026-01-10")).toBe(false);
    });
  });

  describe("toDateString", () => {
    it("formats date correctly", () => {
      // date-fns format uses local time; test with a specific offset-aware date
      const result = toDateString(new Date(2026, 2, 14)); // month is 0-indexed
      expect(result).toBe("2026-03-14");
    });
  });
});
