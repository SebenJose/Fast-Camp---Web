import type { ISession, IUser } from "@/app/types"
import bcrypt from "bcryptjs"
import { localStore, sessionStore } from "@/app/lib/storage"

const STORAGE_KEY = "auth_users"
const SESSION_KEY = "auth_session"

export const AuthService = {
  getStoredUsers(): IUser[] {
    try {
      return JSON.parse(localStore.getItem(STORAGE_KEY) ?? "[]")
    } catch {
      return []
    }
  },

  async saveUser(user: IUser): Promise<void> {
    const users = this.getStoredUsers()
    const hashedPassword = await bcrypt.hash(user.password, 10)
    users.push({ ...user, password: hashedPassword })
    localStore.setItem(STORAGE_KEY, JSON.stringify(users))
  },

  getSession(): ISession | null {
    try {
      const raw = sessionStore.getItem(SESSION_KEY)
      return raw ? (JSON.parse(raw) as ISession) : null
    } catch {
      return null
    }
  },

  setSession(session: ISession): void {
    sessionStore.setItem(SESSION_KEY, JSON.stringify(session))
  },

  clearSession(): void {
    sessionStore.removeItem(SESSION_KEY)
  },
}
