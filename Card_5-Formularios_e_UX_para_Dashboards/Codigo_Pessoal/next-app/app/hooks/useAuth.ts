"use client"

import { useContext } from "react"
import { AuthContext } from "@/app/contexts"
import type { AuthContextValue } from "@/app/types"

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
  return ctx
}
