import type { ISession, IUser } from "@/app/hooks/useAuth"

const STORAGE_KEY = "auth_users"
const SESSION_KEY = "auth_session"

export const AuthService = {
  getStoredUsers(): IUser[] {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")
    } catch {
      return []
    }
  },

  saveUser(user: IUser): void {
    const users = this.getStoredUsers()
    users.push(user)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
  },

  getSession(): ISession | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as ISession) : null
    } catch {
      return null
    }
  },

  setSession(session: ISession): void {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
  },

  clearSession(): void {
    sessionStorage.removeItem(SESSION_KEY)
  },
}
