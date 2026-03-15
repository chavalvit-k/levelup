import { create } from "zustand";
import type { User } from "@/lib/types";

interface UserStore {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      set({ user: data.user, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  updateUser: async (data) => {
    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      set({ user: result.user });
    } catch {
      // ignore
    }
  },
}));
