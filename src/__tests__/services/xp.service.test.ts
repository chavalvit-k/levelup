import { describe, it, expect } from "vitest";
import {
  calculateTaskXp,
  calculateDailyCompletionBonus,
  sumDayXp,
} from "@/lib/services/xp.service";

describe("XP Service", () => {
  describe("calculateTaskXp", () => {
    it("returns base XP for trivial task, no hero, no daily bonus", () => {
      const result = calculateTaskXp("trivial", false, false, 0);
      expect(result.baseXp).toBe(5);
      expect(result.heroBonusXp).toBe(0);
      expect(result.dailyCompletionBonusXp).toBe(0);
      expect(result.totalXp).toBe(5);
    });

    it("returns base XP for standard task", () => {
      const result = calculateTaskXp("standard", false, false, 0);
      expect(result.baseXp).toBe(10);
      expect(result.totalXp).toBe(10);
    });

    it("returns base XP for challenging task", () => {
      const result = calculateTaskXp("challenging", false, false, 0);
      expect(result.baseXp).toBe(15);
    });

    it("returns base XP for heroic task", () => {
      const result = calculateTaskXp("heroic", false, false, 0);
      expect(result.baseXp).toBe(20);
    });

    it("adds hero bonus XP of 10 when isHeroTask=true", () => {
      const result = calculateTaskXp("standard", true, false, 0);
      expect(result.baseXp).toBe(10);
      expect(result.heroBonusXp).toBe(10);
      expect(result.totalXp).toBe(20);
    });

    it("calculates 20% daily completion bonus on total XP when allCompleted=true", () => {
      // Previous tasks earned 20 XP today, this task is heroic (20 XP), no hero bonus
      // total before bonus = 20 + 20 + 0 = 40, bonus = 40 * 0.2 = 8
      const result = calculateTaskXp("heroic", false, true, 20);
      expect(result.baseXp).toBe(20);
      expect(result.dailyCompletionBonusXp).toBe(8);
      expect(result.totalXp).toBe(28);
    });

    it("includes hero bonus in daily completion bonus calculation", () => {
      // Heroic hero task: base=20, hero bonus=10 → xp before bonus = 0 + 20 + 10 = 30
      // bonus = 30 * 0.2 = 6
      const result = calculateTaskXp("heroic", true, true, 0);
      expect(result.baseXp).toBe(20);
      expect(result.heroBonusXp).toBe(10);
      expect(result.dailyCompletionBonusXp).toBe(6);
      expect(result.totalXp).toBe(36);
    });

    it("does not add daily bonus when allCompleted=false", () => {
      const result = calculateTaskXp("heroic", true, false, 50);
      expect(result.dailyCompletionBonusXp).toBe(0);
    });
  });

  describe("calculateDailyCompletionBonus", () => {
    it("returns 20% of total day XP rounded", () => {
      expect(calculateDailyCompletionBonus(100)).toBe(20);
      expect(calculateDailyCompletionBonus(50)).toBe(10);
      expect(calculateDailyCompletionBonus(33)).toBe(7); // Math.round(6.6) = 7
    });

    it("returns 0 for 0 XP", () => {
      expect(calculateDailyCompletionBonus(0)).toBe(0);
    });
  });

  describe("sumDayXp", () => {
    it("sums up base XP for all tasks", () => {
      const tasks = [
        { difficulty: "trivial" as const, isHeroTask: false },
        { difficulty: "standard" as const, isHeroTask: false },
      ];
      // 5 + 10 = 15
      expect(sumDayXp(tasks)).toBe(15);
    });

    it("adds hero bonus for hero tasks", () => {
      const tasks = [
        { difficulty: "standard" as const, isHeroTask: true },
        { difficulty: "challenging" as const, isHeroTask: false },
      ];
      // (10 + 10) + 15 = 35
      expect(sumDayXp(tasks)).toBe(35);
    });

    it("returns 0 for empty array", () => {
      expect(sumDayXp([])).toBe(0);
    });
  });
});
