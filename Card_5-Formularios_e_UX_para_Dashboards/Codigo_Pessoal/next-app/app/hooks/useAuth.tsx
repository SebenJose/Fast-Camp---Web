"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { AuthService } from "@/app/services"
import bcrypt from "bcryptjs"
import type { ISession, AuthContextValue } from "@/app/types"

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ISession | null>(() => {
    return AuthService.getSession()
  })

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const users = AuthService.getStoredUsers()
        const user = users.find((u) => u.email === email)

        if (!user) return "E-mail ou senha incorretos."

        const isPasswordValid = await bcrypt.compare(password, user.password)
        if (!isPasswordValid) return "E-mail ou senha incorretos."

        const newSession: ISession = { name: user.name, email: user.email }
        AuthService.setSession(newSession)
        setSession(newSession)
        return null
      } catch (error) {
        console.error("Erro no signIn:", error)
        return "Ocorreu um erro ao tentar fazer login. Tente novamente."
      }
    },
    [setSession]
  )

  const signUp = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ): Promise<string | null> => {
      try {
        const users = AuthService.getStoredUsers()
        if (users.find((u) => u.email === email))
          return "Este e-mail já está cadastrado."

        await AuthService.saveUser({ name, email, password })
        const newSession: ISession = { name, email }
        AuthService.setSession(newSession)
        setSession(newSession)
        return null
      } catch (error) {
        console.error("Erro no signUp:", error)
        return "Ocorreu um erro ao tentar criar a conta. Tente novamente."
      }
    },
    [setSession]
  )

  const signOut = useCallback(() => {
    AuthService.clearSession()
    setSession(null)
  }, [setSession])

  return (
    <AuthContext.Provider value={{ session, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}
