import { describe, it, expect } from "vitest";
import {
  streakRewardMilestone,
  levelCustomRewardMilestone,
  defaultStreakRewardDescription,
  defaultLevelRewardDescription,
  isStreakReward,
  isLevelMilestoneReward,
} from "@/lib/services/reward.service";
import {
  STREAK_REWARD_INTERVAL,
  LEVEL_CUSTOM_REWARD_INTERVAL,
} from "@/lib/constants";

// ─── helpers used in the Rewards page ────────────────────────────────────────

function nextStreakMilestone(streak: number): number {
  return (
    (Math.floor(streak / STREAK_REWARD_INTERVAL) + 1) * STREAK_REWARD_INTERVAL
  );
}

function progressInSegment(streak: number): number {
  return (
    streak -
    Math.floor(streak / STREAK_REWARD_INTERVAL) * STREAK_REWARD_INTERVAL
  );
}

function nextLevelMilestone(level: number): number {
  return (
    (Math.floor(level / LEVEL_CUSTOM_REWARD_INTERVAL) + 1) *
    LEVEL_CUSTOM_REWARD_INTERVAL
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Reward Service", () => {
  describe("streakRewardMilestone", () => {
    it("returns null for streak = 0", () => {
      expect(streakRewardMilestone(0)).toBeNull();
    });

    it("returns null for non-milestone streaks", () => {
      expect(streakRewardMilestone(1)).toBeNull();
      expect(streakRewardMilestone(9)).toBeNull();
      expect(streakRewardMilestone(11)).toBeNull();
      expect(streakRewardMilestone(19)).toBeNull();
    });

    it("returns milestone value at each STREAK_REWARD_INTERVAL", () => {
      expect(streakRewardMilestone(10)).toBe(10);
      expect(streakRewardMilestone(20)).toBe(20);
      expect(streakRewardMilestone(30)).toBe(30);
      expect(streakRewardMilestone(50)).toBe(50);
    });

    it("milestone interval constant is 10", () => {
      expect(STREAK_REWARD_INTERVAL).toBe(10);
    });
  });

  describe("levelCustomRewardMilestone", () => {
    it("returns null for level = 0", () => {
      expect(levelCustomRewardMilestone(0)).toBeNull();
    });

    it("returns null for non-milestone levels", () => {
      expect(levelCustomRewardMilestone(1)).toBeNull();
      expect(levelCustomRewardMilestone(4)).toBeNull();
      expect(levelCustomRewardMilestone(6)).toBeNull();
    });

    it("returns milestone value at each LEVEL_CUSTOM_REWARD_INTERVAL", () => {
      expect(levelCustomRewardMilestone(5)).toBe(5);
      expect(levelCustomRewardMilestone(10)).toBe(10);
      expect(levelCustomRewardMilestone(15)).toBe(15);
      expect(levelCustomRewardMilestone(30)).toBe(30);
    });

    it("milestone interval constant is 5", () => {
      expect(LEVEL_CUSTOM_REWARD_INTERVAL).toBe(5);
    });
  });

  describe("reward description helpers", () => {
    it("defaultStreakRewardDescription includes milestone number", () => {
      expect(defaultStreakRewardDescription(10)).toContain("10");
      expect(defaultStreakRewardDescription(20)).toContain("20");
    });

    it("defaultLevelRewardDescription includes level number", () => {
      expect(defaultLevelRewardDescription(5)).toContain("5");
      expect(defaultLevelRewardDescription(15)).toContain("15");
    });
  });

  describe("reward type helpers", () => {
    it("isStreakReward identifies streak rewards", () => {
      expect(isStreakReward("streak")).toBe(true);
      expect(isStreakReward("level_milestone")).toBe(false);
    });

    it("isLevelMilestoneReward identifies level rewards", () => {
      expect(isLevelMilestoneReward("level_milestone")).toBe(true);
      expect(isLevelMilestoneReward("streak")).toBe(false);
    });
  });
});

describe("Rewards Progression Track helpers", () => {
  describe("nextStreakMilestone", () => {
    it("returns 10 when streak is 0", () => {
      expect(nextStreakMilestone(0)).toBe(10);
    });

    it("returns 10 when streak is 1..9", () => {
      for (let i = 1; i <= 9; i++) {
        expect(nextStreakMilestone(i)).toBe(10);
      }
    });

    it("returns 20 when streak is exactly 10", () => {
      expect(nextStreakMilestone(10)).toBe(20);
    });

    it("returns 20 when streak is 11..19", () => {
      for (let i = 11; i <= 19; i++) {
        expect(nextStreakMilestone(i)).toBe(20);
      }
    });

    it("returns 50 when streak is 40..49", () => {
      expect(nextStreakMilestone(40)).toBe(50);
      expect(nextStreakMilestone(49)).toBe(50);
    });
  });

  describe("progressInSegment", () => {
    it("streak 0 → progress 0 within 0–10 segment", () => {
      expect(progressInSegment(0)).toBe(0);
    });

    it("streak 7 → progress 7 within 0–10 segment", () => {
      expect(progressInSegment(7)).toBe(7);
    });

    it("streak 10 → progress 0 within 10–20 segment (already at milestone)", () => {
      expect(progressInSegment(10)).toBe(0);
    });

    it("streak 17 → progress 7 within 10–20 segment", () => {
      expect(progressInSegment(17)).toBe(7);
    });
  });

  describe("nextLevelMilestone", () => {
    it("returns 5 when level is 0..4", () => {
      for (let i = 0; i <= 4; i++) {
        expect(nextLevelMilestone(i)).toBe(5);
      }
    });

    it("returns 10 when level is exactly 5", () => {
      expect(nextLevelMilestone(5)).toBe(10);
    });

    it("returns 10 when level is 6..9", () => {
      for (let i = 6; i <= 9; i++) {
        expect(nextLevelMilestone(i)).toBe(10);
      }
    });

    it("returns 30 when level is 25..29", () => {
      expect(nextLevelMilestone(25)).toBe(30);
      expect(nextLevelMilestone(29)).toBe(30);
    });
  });
});

describe("Heatmap color intensity logic", () => {
  // Pure function extracted from ActivityHeatmap for testing
  function intensityColor(count: number, max: number): string {
    if (count === 0) return "#1F2937";
    if (max === 0) return "#22C55E";
    const ratio = count / max;
    if (ratio < 0.25) return "#14532d";
    if (ratio < 0.5) return "#166534";
    if (ratio < 0.75) return "#16a34a";
    return "#22C55E";
  }

  it("returns dark color for count = 0", () => {
    expect(intensityColor(0, 10)).toBe("#1F2937");
  });

  it("returns brightest green for max = 0 (avoids div-by-zero)", () => {
    expect(intensityColor(1, 0)).toBe("#22C55E");
  });

  it("returns darkest green for low counts (< 25% of max)", () => {
    expect(intensityColor(1, 10)).toBe("#14532d"); // 10%
    expect(intensityColor(2, 10)).toBe("#14532d"); // 20%
  });

  it("returns medium-dark green for 25–49% of max", () => {
    expect(intensityColor(3, 10)).toBe("#166534"); // 30%
    expect(intensityColor(4, 10)).toBe("#166534"); // 40%
  });

  it("returns medium-bright green for 50–74% of max", () => {
    expect(intensityColor(5, 10)).toBe("#16a34a"); // 50%
    expect(intensityColor(7, 10)).toBe("#16a34a"); // 70%
  });

  it("returns brightest green for >= 75% of max", () => {
    expect(intensityColor(8, 10)).toBe("#22C55E"); // 80%
    expect(intensityColor(10, 10)).toBe("#22C55E"); // 100%
  });
});
