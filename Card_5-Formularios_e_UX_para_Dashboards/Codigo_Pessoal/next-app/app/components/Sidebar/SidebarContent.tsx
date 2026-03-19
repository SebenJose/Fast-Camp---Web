"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { SidebarContentProps } from "./types"
import { Menu, LogOut } from "lucide-react"
import { cn } from "@/app/lib/utils"
import {
  Avatar, AvatarFallback, AvatarImage,
  Button,
  Dialog, DialogContent, DialogClose,
} from "../ui"
import { AuthModal } from "../Auth"
import { useAuth } from "@/app/hooks/useAuth"

export function SidebarContent({ items, onItemClick }: SidebarContentProps) {
  const pathname = usePathname()
  const { session, signOut } = useAuth()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const initials = session?.name
    ? session.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?"

  return (
    <>
      <nav className="flex h-full w-full flex-col gap-4 overflow-hidden px-2 py-6">
      {/* Menu Icon + Logo/Brand */}
      <div className="mb-2 flex items-center px-2">
        <div className="flex w-8 shrink-0 items-center justify-center">
          <Menu size={24} className="text-sidebar-foreground" />
        </div>
        <h1 className="ml-4 text-xl font-bold whitespace-nowrap text-sidebar-foreground opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/sidebar:opacity-100">
          Menu
        </h1>
      </div>
      <div className="mb-6 px-2">
        <div className="h-px w-full bg-sidebar-border" />
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center rounded-lg p-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent/20 active:bg-sidebar-accent/30",
                isActive &&
                  "border border-white/80 bg-sidebar-accent/10 shadow-sm"
              )}
            >
              <div className="flex w-8 shrink-0 items-center justify-center">
                <Icon size={20} className="text-sidebar-foreground" />
              </div>
              <span className="ml-4 text-sm font-medium whitespace-nowrap opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/sidebar:opacity-100">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>

      {/* User Profile */}
      <div className="mt-auto">
        {session ? (
          /* ── Logged In ──────────────────────────────── */
          <div className="flex items-center justify-between rounded-lg p-2">
            <div className="flex items-center gap-0">
              <div className="flex w-8 shrink-0 items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={session.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4 flex flex-col overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/sidebar:opacity-100">
                <span className="text-sm font-medium text-sidebar-foreground">
                  {session.name}
                </span>
                <span className="text-xs text-sidebar-foreground/70">
                  {session.email}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setConfirmOpen(true)}
              className="shrink-0 opacity-0 transition-opacity group-hover/sidebar:opacity-100"
              aria-label="Sair"
            >
              <LogOut size={16} className="text-sidebar-foreground/70" />
            </Button>
          </div>
        ) : (
          /* ── Guest ──────────────────────────────────── */
          <AuthModal>
            <div className="flex cursor-pointer items-center rounded-lg p-2 transition-all hover:bg-sidebar-accent/20">
              <div className="flex w-8 shrink-0 items-center justify-center">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="@Perfil" />
                  <AvatarFallback>PE</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4 flex flex-col overflow-hidden whitespace-nowrap opacity-100 transition-opacity duration-200 md:opacity-0 md:group-hover/sidebar:opacity-100">
                <span className="text-sm font-medium text-sidebar-foreground">
                  Fazer Login
                </span>
                <span className="text-xs text-sidebar-foreground/70">
                  Clique para acessar
                </span>
              </div>
            </div>
          </AuthModal>
        )}
      </div>
    </nav>

    {/* Sign-out confirmation dialog */}
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-base font-semibold text-foreground">
              Confirmar saída
            </p>
            <p className="text-sm text-muted-foreground">
              Tem certeza que deseja sair da sua conta? Você precisará fazer
              login novamente para acessar o painel.
            </p>
          </div>
          <div className="flex justify-end gap-3">
            <DialogClose render={<Button variant="outline" />}>
              Cancelar
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                signOut()
                setConfirmOpen(false)
              }}
            >
              Sair da conta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

