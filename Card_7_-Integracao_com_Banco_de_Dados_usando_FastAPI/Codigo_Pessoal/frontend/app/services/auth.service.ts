import type { ISession, IUser } from "@/app/types"
import { sessionStore } from "@/app/lib/storage"
import { STORAGE_KEYS } from "@/app/config/constants"
import { apiClient } from "@/app/services/api/client"

const SESSION_KEY = STORAGE_KEYS.AUTH_SESSION

export const AuthService = {
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const body = new URLSearchParams()
    // O backend espera um form data com username e password
    // O username no caso do OAuth2PasswordRequestForm é o email
    body.append("username", email)
    body.append("password", password)

    return apiClient<{ access_token: string }>("/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    })
  },

  async register(user: IUser): Promise<void> {
    await apiClient("/users/", {
      method: "POST",
      body: JSON.stringify({
        username: user.name,
        email: user.email,
        password: user.password,
      }),
    })
  },

  async getUserMe(token: string): Promise<{ username: string; email: string }> {
    return apiClient<{ username: string; email: string }>("/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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
