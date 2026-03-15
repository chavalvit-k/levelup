import { describe, it, expect } from "vitest";
import {
  computeElapsed,
  startTimer,
  pauseTimer,
  stopTimer,
  hasReachedRequiredDuration,
  TimerSnapshot,
} from "@/lib/services/timer.service";

describe("Timer Service", () => {
  describe("computeElapsed", () => {
    it("returns current elapsed when idle", () => {
      const snap: TimerSnapshot = {
        elapsed: 120,
        startedAt: null,
        status: "idle",
      };
      expect(computeElapsed(snap)).toBe(120);
    });

    it("adds time since startedAt when running", () => {
      const now = Date.now();
      const snap: TimerSnapshot = {
        elapsed: 60,
        startedAt: now - 30000, // started 30s ago
        status: "running",
      };
      expect(computeElapsed(snap, now)).toBe(90);
    });

    it("returns elapsed when paused (no startedAt)", () => {
      const snap: TimerSnapshot = {
        elapsed: 200,
        startedAt: null,
        status: "paused",
      };
      expect(computeElapsed(snap)).toBe(200);
    });
  });

  describe("startTimer", () => {
    it("transitions idle to running", () => {
      const snap: TimerSnapshot = {
        elapsed: 0,
        startedAt: null,
        status: "idle",
      };
      const now = Date.now();
      const result = startTimer(snap, now);
      expect(result.status).toBe("running");
      expect(result.startedAt).toBe(now);
    });

    it("does not restart if already running", () => {
      const now = Date.now();
      const snap: TimerSnapshot = {
        elapsed: 10,
        startedAt: now - 5000,
        status: "running",
      };
      const result = startTimer(snap, now);
      expect(result.startedAt).toBe(now - 5000); // unchanged
    });
  });

  describe("pauseTimer", () => {
    it("captures elapsed time and transitions to paused", () => {
      const now = Date.now();
      const snap: TimerSnapshot = {
        elapsed: 60,
        startedAt: now - 20000, // 20s of additional time
        status: "running",
      };
      const result = pauseTimer(snap, now);
      expect(result.status).toBe("paused");
      expect(result.elapsed).toBe(80);
      expect(result.startedAt).toBeNull();
    });

    it("does nothing if already paused", () => {
      const snap: TimerSnapshot = {
        elapsed: 50,
        startedAt: null,
        status: "paused",
      };
      const result = pauseTimer(snap);
      expect(result).toEqual(snap);
    });
  });

  describe("stopTimer", () => {
    it("resets to idle with 0 elapsed", () => {
      const result = stopTimer();
      expect(result.status).toBe("idle");
      expect(result.elapsed).toBe(0);
      expect(result.startedAt).toBeNull();
    });
  });

  describe("hasReachedRequiredDuration", () => {
    it("returns false when requiredDuration is null", () => {
      expect(hasReachedRequiredDuration(3600, null)).toBe(false);
    });

    it("returns false when elapsed < required", () => {
      expect(hasReachedRequiredDuration(1800, 3600)).toBe(false);
    });

    it("returns true when elapsed equals required", () => {
      expect(hasReachedRequiredDuration(3600, 3600)).toBe(true);
    });

    it("returns true when elapsed exceeds required", () => {
      expect(hasReachedRequiredDuration(4000, 3600)).toBe(true);
    });
  });
});
