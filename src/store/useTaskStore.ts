import { create } from "zustand";
import type { DailyTask, TaskCompletionResult } from "@/lib/types";
import { todayString } from "@/lib/services/streak.service";

interface TaskStore {
  tasks: DailyTask[];
  selectedDate: string;
  isLoading: boolean;
  lastCompletionResult: TaskCompletionResult | null;

  setSelectedDate: (date: string) => void;
  fetchTasks: (date?: string) => Promise<void>;
  createTask: (input: {
    title: string;
    date: string;
    difficulty: string;
    taskType: string;
    requiredDuration?: number;
    isHeroTask?: boolean;
    subtasks?: { title: string }[];
  }) => Promise<void>;
  updateTask: (id: string, data: Partial<DailyTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<TaskCompletionResult>;
  toggleSubtask: (subtaskId: string, done: boolean) => Promise<void>;
  rolloverFailed: () => Promise<void>;
  clearCompletionResult: () => void;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  selectedDate: todayString(),
  isLoading: false,
  lastCompletionResult: null,

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    get().fetchTasks(date);
  },

  fetchTasks: async (date) => {
    const d = date ?? get().selectedDate;
    set({ isLoading: true });
    try {
      const res = await fetch(`/api/daily-tasks?date=${d}`);
      const data = await res.json();
      set({ tasks: data.tasks ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createTask: async (input) => {
    const res = await fetch("/api/daily-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to create task");
    }
    await get().fetchTasks();
  },

  updateTask: async (id, data) => {
    await fetch(`/api/daily-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    await fetch(`/api/daily-tasks/${id}`, { method: "DELETE" });
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  completeTask: async (id) => {
    const res = await fetch("/api/daily-tasks/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId: id }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? "Failed to complete task");
    }
    const result: TaskCompletionResult = await res.json();
    set({ lastCompletionResult: result });
    await get().fetchTasks();
    return result;
  },

  toggleSubtask: async (subtaskId, done) => {
    await fetch(`/api/subtasks/${subtaskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    // Update local state
    set({
      tasks: get().tasks.map((t) => ({
        ...t,
        subtasks: t.subtasks.map((s) =>
          s.id === subtaskId ? { ...s, done } : s,
        ),
      })),
    });
  },

  rolloverFailed: async () => {
    await fetch("/api/daily-tasks/rollover", { method: "POST" });
    await get().fetchTasks();
  },

  clearCompletionResult: () => set({ lastCompletionResult: null }),
}));
