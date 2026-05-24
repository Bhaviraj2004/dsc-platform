import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Role = "CA" | "CLIENT";

type User = {
  id: number;
  email: string;
  role: Role;
};

type AuthStore = {
  user: User | null;
  token: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      _hasHydrated: false,

      setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),

      setAuth: (user, token) => {
        localStorage.setItem("access_token", token);
        document.cookie = `access_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`;
        set({ user, token });
      },

      logout: () => {
        localStorage.removeItem("access_token");
        document.cookie = "access_token=; path=/; max-age=0";
        set({ user: null, token: null });
      },

      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : {
              getItem: () => null,
              setItem: () => {},
              removeItem: () => {},
            }
      ),
      // Called when Zustand finishes loading from localStorage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
