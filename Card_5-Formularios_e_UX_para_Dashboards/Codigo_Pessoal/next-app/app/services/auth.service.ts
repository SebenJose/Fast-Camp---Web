import type { ISession, IUser } from "@/app/types"
import bcrypt from "bcryptjs"
import { localStore, sessionStore } from "@/app/lib/storage"
import { STORAGE_KEYS } from "@/app/config/constants"

const STORAGE_KEY = STORAGE_KEYS.AUTH_USERS
const SESSION_KEY = STORAGE_KEYS.AUTH_SESSION

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
