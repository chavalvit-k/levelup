import { create } from "zustand";
import type { GeneralTask } from "@/lib/types";

interface GeneralTaskStore {
  tasks: GeneralTask[];
  isLoading: boolean;
  fetchTasks: () => Promise<void>;
  createTask: (input: {
    title: string;
    priority?: string;
    deadline?: string;
  }) => Promise<void>;
  updateTask: (id: string, data: Partial<GeneralTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleDone: (id: string, done: boolean) => Promise<void>;
}

export const useGeneralTaskStore = create<GeneralTaskStore>((set, get) => ({
  tasks: [],
  isLoading: false,

  fetchTasks: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/general-tasks");
      const data = await res.json();
      set({ tasks: data.tasks ?? [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createTask: async (input) => {
    const res = await fetch("/api/general-tasks", {
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
    await fetch(`/api/general-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    await get().fetchTasks();
  },

  deleteTask: async (id) => {
    await fetch(`/api/general-tasks/${id}`, { method: "DELETE" });
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  toggleDone: async (id, done) => {
    await fetch(`/api/general-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done }),
    });
    set({
      tasks: get().tasks.map((t) => (t.id === id ? { ...t, done } : t)),
    });
  },
}));
