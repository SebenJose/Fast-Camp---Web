import type { MockAuthSession, MockAuthUser } from "../types/auth";
import {
  mockAuthSessionSchema,
  mockAuthUsersSchema,
  type LoginFormData,
  type RegisterFormData,
} from "../schemas/auth-schemas";

const AUTH_USERS_STORAGE_KEY = "organiza-ai:auth-users";
const AUTH_SESSION_STORAGE_KEY = "organiza-ai:auth-session";

export const AUTH_SESSION_CHANGED_EVENT = "organiza-ai:auth-session-changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function emitSessionChanged() {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT));
}

function getStoredUsers() {
  if (!isBrowser()) {
    return [];
  }

  try {
    const storedUsers = window.localStorage.getItem(AUTH_USERS_STORAGE_KEY);

    if (!storedUsers) {
      return [];
    }

    const parsedUsers = mockAuthUsersSchema.safeParse(JSON.parse(storedUsers));

    return parsedUsers.success ? parsedUsers.data : [];
  } catch {
    return [];
  }
}

function saveUsers(users: MockAuthUser[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(AUTH_USERS_STORAGE_KEY, JSON.stringify(users));
}

function saveSession(user: MockAuthUser) {
  const session: MockAuthSession = {
    userId: user.id,
    name: user.name,
    email: user.email,
  };

  if (!isBrowser()) {
    return session;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
  emitSessionChanged();

  return session;
}

export function getMockAuthSession() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const storedSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

    if (!storedSession) {
      return null;
    }

    const parsedSession = mockAuthSessionSchema.safeParse(
      JSON.parse(storedSession),
    );

    return parsedSession.success ? parsedSession.data : null;
  } catch {
    return null;
  }
}

export function registerMockUser(data: RegisterFormData) {
  const users = getStoredUsers();
  const normalizedEmail = data.email.toLowerCase();
  const existingUser = users.find((user) => user.email === normalizedEmail);

  if (existingUser) {
    return {
      ok: false as const,
      message: "Já existe uma conta cadastrada com esse e-mail.",
    };
  }

  const newUser: MockAuthUser = {
    id: globalThis.crypto?.randomUUID() ?? `user-${Date.now()}`,
    name: data.name,
    email: normalizedEmail,
    password: data.password,
    createdAt: new Date().toISOString(),
  };

  saveUsers([...users, newUser]);

  return {
    ok: true as const,
    session: saveSession(newUser),
  };
}

export function loginMockUser(data: LoginFormData) {
  const normalizedEmail = data.email.toLowerCase();
  const user = getStoredUsers().find(
    (storedUser) =>
      storedUser.email === normalizedEmail &&
      storedUser.password === data.password,
  );

  if (!user) {
    return {
      ok: false as const,
      message: "E-mail ou senha inválidos.",
    };
  }

  return {
    ok: true as const,
    session: saveSession(user),
  };
}

export function logoutMockUser() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
  emitSessionChanged();
}
