import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "../services/authService";
import type { AuthStatus, LoginCredentials, RegisterInput, User } from "../types";

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const initialState: AuthState = {
  user: null,
  status: "idle",
  error: null,
};

/**
 * Feature-scoped auth store (Zustand + persist). Holds the user profile for
 * client-side display only — the actual session lives in an HttpOnly cookie
 * set by the `/api/auth/*` route handlers, so no token ever passes through
 * this store or localStorage.
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      login: async (credentials) => {
        set({ status: "authenticating", error: null });
        try {
          const { user } = await authService.login(credentials);
          set({ user, status: "authenticated", error: null });
        } catch (error) {
          set({
            status: "error",
            error: error instanceof Error ? error.message : "Login failed",
          });
          throw error;
        }
      },

      register: async (input) => {
        set({ status: "authenticating", error: null });
        try {
          const { user } = await authService.register(input);
          set({ user, status: "authenticated", error: null });
        } catch (error) {
          set({
            status: "error",
            error: error instanceof Error ? error.message : "Registration failed",
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ ...initialState });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "studio-auth",
      storage: createJSONStorage(() => localStorage),
      // Only persist the user profile — the session itself is the HttpOnly cookie.
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) state.status = "authenticated";
      },
    },
  ),
);
