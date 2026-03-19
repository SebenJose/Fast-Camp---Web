"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { AuthService } from "@/app/services"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IUser {
  name: string
  email: string
  password: string
}

export interface ISession {
  name: string
  email: string
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface AuthContextValue {
  session: ISession | null
  signIn: (email: string, password: string) => string | null
  signUp: (name: string, email: string, password: string) => string | null
  signOut: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  // Lazy initializer — runs once on mount, before first render
  const [session, setSession] = useState<ISession | null>(() => {
    if (typeof window === "undefined") return null
    return AuthService.getSession()
  })

  const signIn = useCallback(
    (email: string, password: string): string | null => {
      const users = AuthService.getStoredUsers()
      const user = users.find(
        (u) => u.email === email && u.password === password
      )
      if (!user) return "E-mail ou senha incorretos."
      const newSession: ISession = { name: user.name, email: user.email }
      AuthService.setSession(newSession)
      setSession(newSession)
      return null
    },
    []
  )

  const signUp = useCallback(
    (name: string, email: string, password: string): string | null => {
      const users = AuthService.getStoredUsers()
      if (users.find((u) => u.email === email))
        return "Este e-mail já está cadastrado."
      AuthService.saveUser({ name, email, password })
      const newSession: ISession = { name, email }
      AuthService.setSession(newSession)
      setSession(newSession)
      return null
    },
    []
  )

  const signOut = useCallback(() => {
    AuthService.clearSession()
    setSession(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
