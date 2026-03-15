import { describe, it, expect } from "vitest";
import {
  isEligibleForHeroTask,
  validateHeroTask,
  isTimerComplete,
  getPendingOverdueTasks,
  areAllTasksDone,
  hasPendingPastTasks,
  validateTaskDate,
} from "@/lib/services/task.service";
import type { DailyTask } from "@/lib/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeTask(overrides: Partial<DailyTask> = {}): DailyTask {
  return {
    id: "task-1",
    userId: "default_user",
    title: "Test Task",
    date: "2026-01-10",
    difficulty: "standard",
    taskType: "non_timed",
    requiredDuration: null,
    elapsedTime: 0,
    status: "pending",
    isHeroTask: false,
    xpEarned: 0,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    subtasks: [],
    ...overrides,
  };
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("Task Service", () => {
  describe("isEligibleForHeroTask", () => {
    it("trivial is not eligible", () => {
      expect(isEligibleForHeroTask("trivial")).toBe(false);
    });

    it("standard is eligible", () => {
      expect(isEligibleForHeroTask("standard")).toBe(true);
    });

    it("challenging is eligible", () => {
      expect(isEligibleForHeroTask("challenging")).toBe(true);
    });

    it("heroic is eligible", () => {
      expect(isEligibleForHeroTask("heroic")).toBe(true);
    });
  });

  describe("validateHeroTask", () => {
    it("approves a standard task as hero when no existing hero", () => {
      const result = validateHeroTask(
        { difficulty: "standard" },
        null,
        "task-1",
      );
      expect(result.valid).toBe(true);
    });

    it("rejects trivial task as hero task", () => {
      const result = validateHeroTask(
        { difficulty: "trivial" },
        null,
        "task-1",
      );
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });

    it("rejects if another hero task exists", () => {
      const result = validateHeroTask(
        { difficulty: "heroic" },
        "task-99",
        "task-1",
      );
      expect(result.valid).toBe(false);
    });

    it("allows re-assigning hero task to itself (idempotent)", () => {
      const result = validateHeroTask(
        { difficulty: "standard" },
        "task-1",
        "task-1",
      );
      expect(result.valid).toBe(true);
    });
  });

  describe("isTimerComplete", () => {
    it("returns false for non-timed tasks", () => {
      expect(isTimerComplete("non_timed", 10000, 3600)).toBe(false);
    });

    it("returns false when requiredDuration is null", () => {
      expect(isTimerComplete("timed", 10000, null)).toBe(false);
    });

    it("returns false when elapsed < required", () => {
      expect(isTimerComplete("timed", 1800, 3600)).toBe(false);
    });

    it("returns true when elapsed equals required", () => {
      expect(isTimerComplete("timed", 3600, 3600)).toBe(true);
    });

    it("returns true when elapsed exceeds required", () => {
      expect(isTimerComplete("timed", 5000, 3600)).toBe(true);
    });
  });

  describe("getPendingOverdueTasks", () => {
    it("returns pending tasks with past dates", () => {
      const tasks = [
        makeTask({ id: "1", date: "2026-01-05", status: "pending" }),
        makeTask({ id: "2", date: "2026-01-10", status: "pending" }),
        makeTask({ id: "3", date: "2026-01-05", status: "done" }),
      ];
      const overdue = getPendingOverdueTasks(tasks, "2026-01-10");
      expect(overdue).toHaveLength(1);
      expect(overdue[0].id).toBe("1");
    });

    it("returns empty array when no overdue tasks", () => {
      const tasks = [
        makeTask({ id: "1", date: "2026-01-10", status: "pending" }),
        makeTask({ id: "2", date: "2026-01-11", status: "pending" }),
      ];
      expect(getPendingOverdueTasks(tasks, "2026-01-10")).toHaveLength(0);
    });
  });

  describe("areAllTasksDone", () => {
    it("returns true when all tasks are done", () => {
      const tasks = [
        makeTask({ status: "done" }),
        makeTask({ status: "done" }),
      ];
      expect(areAllTasksDone(tasks)).toBe(true);
    });

    it("returns false when any task is pending", () => {
      const tasks = [
        makeTask({ status: "done" }),
        makeTask({ status: "pending" }),
      ];
      expect(areAllTasksDone(tasks)).toBe(false);
    });

    it("returns false for empty task list", () => {
      expect(areAllTasksDone([])).toBe(false);
    });

    it("returns false when a task is failed", () => {
      const tasks = [
        makeTask({ status: "failed" }),
        makeTask({ status: "done" }),
      ];
      expect(areAllTasksDone(tasks)).toBe(false);
    });
  });

  describe("hasPendingPastTasks", () => {
    it("returns true when there are pending past tasks", () => {
      const tasks = [makeTask({ date: "2026-01-05", status: "pending" })];
      expect(hasPendingPastTasks(tasks, "2026-01-10")).toBe(true);
    });

    it("returns false when no pending past tasks", () => {
      const tasks = [
        makeTask({ date: "2026-01-10", status: "pending" }),
        makeTask({ date: "2026-01-05", status: "done" }),
      ];
      expect(hasPendingPastTasks(tasks, "2026-01-10")).toBe(false);
    });
  });

  describe("validateTaskDate", () => {
    it("accepts today's date", () => {
      expect(validateTaskDate("2026-01-10", "2026-01-10").valid).toBe(true);
    });

    it("accepts future dates", () => {
      expect(validateTaskDate("2026-01-20", "2026-01-10").valid).toBe(true);
    });

    it("rejects past dates", () => {
      const result = validateTaskDate("2026-01-05", "2026-01-10");
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
    });
  });
});
