"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/hooks/useAuth"
import { AuthModal } from "./AuthModal"
import { Button } from "@/app/components/ui"
import { Lock } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  if (!mounted) return null

  if (!session) {
    return (
      <div className="flex h-full min-h-[400px] flex-1 animate-in flex-col items-center justify-center p-6 text-center duration-300 fade-in zoom-in">
        <div className="mb-6 rounded-full bg-primary/10 p-6">
          <Lock className="animate-bounce-slow h-12 w-12 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold tracking-tight">
          Acesso Restrito
        </h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          Ops! Identificamos que você ainda não está logado. Para visualizar
          este conteúdo (Dashboards e Formularios), é necessário entrar em sua
          conta.
        </p>

        <AuthModal>
          <Button size="lg" className="rounded-xl px-8 font-bold shadow-lg">
            Fazer Login Agora
          </Button>
        </AuthModal>
      </div>
    )
  }

  return <>{children}</>
}
