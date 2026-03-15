import { describe, it, expect } from "vitest";
import {
  levelFromTotalXp,
  xpWithinLevel,
  xpProgressPercent,
  xpToNextLevel,
  cosmeticSlotForLevel,
  isCustomRewardLevel,
  processXpGain,
  totalXpForLevel,
} from "@/lib/services/level.service";
import { MAX_LEVEL, XP_PER_LEVEL } from "@/lib/constants";

describe("Level Service", () => {
  describe("levelFromTotalXp", () => {
    it("returns level 0 for 0 XP", () => {
      expect(levelFromTotalXp(0)).toBe(0);
    });

    it("returns level 0 for XP below 500", () => {
      expect(levelFromTotalXp(499)).toBe(0);
    });

    it("returns level 1 at exactly 500 XP", () => {
      expect(levelFromTotalXp(500)).toBe(1);
    });

    it("returns correct level at various XP amounts", () => {
      expect(levelFromTotalXp(1000)).toBe(2);
      expect(levelFromTotalXp(2500)).toBe(5);
      expect(levelFromTotalXp(14999)).toBe(29);
      expect(levelFromTotalXp(15000)).toBe(30);
    });

    it("caps at MAX_LEVEL (30)", () => {
      expect(levelFromTotalXp(99999)).toBe(MAX_LEVEL);
    });
  });

  describe("xpWithinLevel", () => {
    it("returns 0 at exact level boundaries", () => {
      expect(xpWithinLevel(0)).toBe(0);
      expect(xpWithinLevel(500)).toBe(0);
      expect(xpWithinLevel(1000)).toBe(0);
    });

    it("returns remainder XP within level", () => {
      expect(xpWithinLevel(750)).toBe(250); // level 1, 250 into it
      expect(xpWithinLevel(1234)).toBe(234); // level 2, 234 into it
    });

    it("returns XP_PER_LEVEL when at max level", () => {
      expect(xpWithinLevel(MAX_LEVEL * XP_PER_LEVEL + 100)).toBe(XP_PER_LEVEL);
    });
  });

  describe("xpProgressPercent", () => {
    it("returns 0 at start of level", () => {
      expect(xpProgressPercent(0)).toBe(0);
    });

    it("returns 50 at halfway through a level", () => {
      expect(xpProgressPercent(250)).toBe(50);
    });

    it("returns 100 at max level", () => {
      expect(xpProgressPercent(MAX_LEVEL * XP_PER_LEVEL)).toBe(100);
    });
  });

  describe("xpToNextLevel", () => {
    it("returns 500 at level 0", () => {
      expect(xpToNextLevel(0)).toBe(500);
    });

    it("returns remaining XP needed", () => {
      expect(xpToNextLevel(300)).toBe(200);
      expect(xpToNextLevel(750)).toBe(250); // level 1, need 250 more
    });

    it("returns 0 at max level", () => {
      expect(xpToNextLevel(MAX_LEVEL * XP_PER_LEVEL)).toBe(0);
    });
  });

  describe("cosmeticSlotForLevel", () => {
    it("level 1 → color", () => {
      expect(cosmeticSlotForLevel(1)).toBe("color");
    });

    it("level 2 → glasses", () => {
      expect(cosmeticSlotForLevel(2)).toBe("glasses");
    });

    it("level 3 → hat", () => {
      expect(cosmeticSlotForLevel(3)).toBe("hat");
    });

    it("level 4 → background", () => {
      expect(cosmeticSlotForLevel(4)).toBe("background");
    });

    it("level 5 → null (custom reward — no cosmetic)", () => {
      expect(cosmeticSlotForLevel(5)).toBeNull();
    });

    it("level 6 → color (cycles back)", () => {
      expect(cosmeticSlotForLevel(6)).toBe("color");
    });

    it("level 10 → null (custom reward)", () => {
      expect(cosmeticSlotForLevel(10)).toBeNull();
    });
  });

  describe("isCustomRewardLevel", () => {
    it("returns true for multiples of 5", () => {
      expect(isCustomRewardLevel(5)).toBe(true);
      expect(isCustomRewardLevel(10)).toBe(true);
      expect(isCustomRewardLevel(15)).toBe(true);
      expect(isCustomRewardLevel(30)).toBe(true);
    });

    it("returns false for non-multiples of 5", () => {
      expect(isCustomRewardLevel(1)).toBe(false);
      expect(isCustomRewardLevel(3)).toBe(false);
      expect(isCustomRewardLevel(7)).toBe(false);
    });

    it("returns false for level 0", () => {
      expect(isCustomRewardLevel(0)).toBe(false);
    });
  });

  describe("processXpGain", () => {
    it("returns null if no level gained", () => {
      const result = processXpGain(0, 100, 50); // 150 XP, still level 0
      expect(result).toBeNull();
    });

    it("returns LevelUpResult when leveling up", () => {
      const result = processXpGain(0, 400, 150); // 550 total → level 1
      expect(result).not.toBeNull();
      expect(result!.newLevel).toBe(1);
      expect(result!.levelsGained).toBe(1);
      expect(result!.newTotalXp).toBe(550);
      expect(result!.newXp).toBe(50); // 550 - 500
      expect(result!.cosmeticUnlocked).toBe("color"); // level 1 → color
      expect(result!.customRewardUnlocked).toBe(false);
    });

    it("flags customRewardUnlocked for level 5", () => {
      // Level 4 = 2000 XP. Need to reach 2500 for level 5
      const result2 = processXpGain(4, 2000, 600); // 2600 → level 5
      expect(result2).not.toBeNull();
      expect(result2!.newLevel).toBe(5);
      expect(result2!.customRewardUnlocked).toBe(true);
      expect(result2!.cosmeticUnlocked).toBeNull(); // level 5 → custom reward only
    });

    it("handles gaining multiple levels at once", () => {
      const result = processXpGain(0, 0, 2000); // 0 → 2000 XP → level 4
      expect(result).not.toBeNull();
      expect(result!.newLevel).toBe(4);
      expect(result!.levelsGained).toBe(4);
      // Cosmetic is for the highest new level
      expect(result!.cosmeticUnlocked).toBe("background"); // level 4 → background
    });

    it("does not exceed max level", () => {
      const result = processXpGain(29, totalXpForLevel(29), 10000);
      expect(result).not.toBeNull();
      expect(result!.newLevel).toBe(MAX_LEVEL);
    });
  });
});
