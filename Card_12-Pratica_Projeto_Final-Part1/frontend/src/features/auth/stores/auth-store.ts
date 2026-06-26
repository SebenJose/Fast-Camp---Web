import { create } from "zustand";

import {
  getAuthSession,
  loginWithCredentials,
  logoutAuthSession,
  registerWithCredentials,
  type AuthActionResult,
  type AuthLogoutResult,
} from "../api/auth-api";
import type { LoginFormData, RegisterFormData } from "../schemas/auth-schemas";
import type { MockAuthSession } from "../types/auth";

type AuthStore = {
  session: MockAuthSession | null;
  isCheckingSession: boolean;
  hydrateSession: () => Promise<void>;
  login: (data: LoginFormData) => Promise<AuthActionResult>;
  register: (data: RegisterFormData) => Promise<AuthActionResult>;
  logout: () => Promise<AuthLogoutResult>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  session: null,
  isCheckingSession: true,
  hydrateSession: async () => {
    const session = await getAuthSession().catch(() => null);

    set({ isCheckingSession: false, session });
  },
  login: async (data) => {
    const result = await loginWithCredentials(data);

    if (result.ok) {
      set({ session: result.session });
    }

    return result;
  },
  register: async (data) => {
    const result = await registerWithCredentials(data);

    if (result.ok) {
      set({ session: result.session });
    }

    return result;
  },
  logout: async () => {
    const didLogout = await logoutAuthSession();

    if (!didLogout) {
      return {
        ok: false,
        message: "Não foi possível encerrar sua sessão. Tente novamente.",
      };
    }

    set({ session: null });

    return { ok: true };
  },
}));
