import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import type { TimerMode, TimerStatus } from "@/lib/types";

interface TimerStore {
  mode: TimerMode;
  status: TimerStatus;
  selectedTaskId: string | null;
  selectedTaskRequiredDuration: number | null;
  elapsed: number; // seconds
  startedAt: number | null; // epoch ms

  // Actions
  setMode: (mode: TimerMode) => void;
  selectTask: (taskId: string, requiredDuration: number | null) => void;
  clearTask: () => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  tick: () => void;
  markCompleted: () => void;
}

export const useTimerStore = create<TimerStore>()(
  subscribeWithSelector((set, get) => ({
    mode: "free",
    status: "idle",
    selectedTaskId: null,
    selectedTaskRequiredDuration: null,
    elapsed: 0,
    startedAt: null,

    setMode: (mode) => {
      const state = get();
      if (state.status === "running" || state.status === "paused") return; // don't switch while active
      set({
        mode,
        elapsed: 0,
        startedAt: null,
        status: "idle",
        selectedTaskId: null,
      });
    },

    selectTask: (taskId, requiredDuration) => {
      const state = get();
      if (state.status === "running" || state.status === "paused") return;
      set({
        mode: "task",
        selectedTaskId: taskId,
        selectedTaskRequiredDuration: requiredDuration,
        elapsed: 0,
        startedAt: null,
        status: "idle",
      });
    },

    clearTask: () => {
      set({
        selectedTaskId: null,
        selectedTaskRequiredDuration: null,
        elapsed: 0,
        startedAt: null,
        status: "idle",
        mode: "free",
      });
    },

    start: () => {
      const state = get();
      if (state.status === "running") return;
      set({ status: "running", startedAt: Date.now() });
    },

    pause: () => {
      const state = get();
      if (state.status !== "running") return;
      const additional = Math.floor(
        (Date.now() - (state.startedAt ?? Date.now())) / 1000,
      );
      set({
        status: "paused",
        elapsed: state.elapsed + additional,
        startedAt: null,
      });
    },

    stop: () => {
      set({ status: "idle", elapsed: 0, startedAt: null });
    },

    tick: () => {
      const state = get();
      if (state.status !== "running") return;
      const newElapsed =
        state.elapsed +
        Math.floor((Date.now() - (state.startedAt ?? Date.now())) / 1000);
      set({ elapsed: newElapsed, startedAt: Date.now() });
    },

    markCompleted: () => {
      set({ status: "completed" });
    },
  })),
);
