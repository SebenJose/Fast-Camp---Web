"use client"

import { createContext, useState, useCallback, type ReactNode } from "react"
import { AuthService } from "@/app/services"
import type { ISession, AuthContextValue } from "@/app/types"

export const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ISession | null>(() => {
    return AuthService.getSession()
  })

  const signIn = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      try {
        const { access_token } = await AuthService.login(email, password)
        const userMe = await AuthService.getUserMe(access_token)

        const newSession: ISession = {
          name: userMe.username,
          email: userMe.email,
          token: access_token,
        }

        AuthService.setSession(newSession)
        setSession(newSession)
        return null
      } catch (error: unknown) {
        console.error("Erro no signIn:", error)
        if (error instanceof Error) {
          return error.message
        }
        return "E-mail ou senha incorretos."
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
        await AuthService.register({ name, email, password })

        // Após o registro ser bem sucedido, efetuamos o login automaticamente
        const { access_token } = await AuthService.login(email, password)

        const newSession: ISession = {
          name,
          email,
          token: access_token,
        }

        AuthService.setSession(newSession)
        setSession(newSession)
        return null
      } catch (error: unknown) {
        console.error("Erro no signUp:", error)
        if (error instanceof Error) {
          return error.message
        }
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
