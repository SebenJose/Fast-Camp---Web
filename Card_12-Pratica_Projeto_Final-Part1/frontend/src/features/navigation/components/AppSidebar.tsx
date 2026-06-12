"use client";

import {
  BotMessageSquare,
  CalendarDays,
  LayoutDashboard,
  LogIn,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/features/auth/stores/auth-store";

interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home",      label: "Agenda",      href: "/",         icon: CalendarDays    },
  { id: "dashboard", label: "Dashboard",   href: "/dashboard", icon: LayoutDashboard },
  { id: "ai-chat",   label: "Chat com IA", href: "/ai-chat",   icon: BotMessageSquare },
];

function getProfileInitials(name: string, email: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return (initials || email[0] || "U").toUpperCase();
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const session = useAuthStore((store) => store.session);
  const logout = useAuthStore((store) => store.logout);

  async function handleLogout() {
    await logout();
    toast.info("Sessão encerrada.");
    router.push("/auth");
  }

  const profileName = session?.name ?? "Visitante";
  const profileEmail = session?.email ?? "sem sessão ativa";
  const profileInitials = getProfileInitials(profileName, profileEmail);

  return (
    <aside
      aria-label="Navegação principal"
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col",
        "bg-opaque-black border-r border-app-border",
        "transition-[width] duration-300 ease-in-out",
        isExpanded ? "w-56" : "w-16",
      )}
    >
      {/* Itens de navegação */}
      <nav className="flex flex-1 flex-col gap-1 overflow-hidden py-3">
        {NAV_ITEMS.map(({ id, label, href, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={id}
              href={href}
              title={label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "relative flex items-center rounded-lg transition-colors duration-150",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secundary-title/50",
                isExpanded
                  ? "mx-2 h-10 px-3"
                  : "mx-auto h-11 w-11 justify-center",
                isActive
                  ? "bg-card-opaque text-secundary-title"
                  : "text-app-muted hover:bg-card-opaque hover:text-primary-title",
              )}
            >
              {isActive && (
                <span className="absolute left-0 inset-y-2 w-0.5 rounded-r-full bg-secundary-title" />
              )}

              <Icon
                size={20}
                strokeWidth={isActive ? 2.5 : 1.8}
                className="shrink-0"
                aria-hidden="true"
              />

              <span
                className={cn(
                  "whitespace-nowrap text-sm font-medium",
                  "overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out",
                  isExpanded ? "ml-3 max-w-[140px] opacity-100" : "max-w-0 opacity-0",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-3 space-y-1 overflow-hidden">
        <div
          className={cn(
            "flex items-center rounded-lg transition-colors duration-150",
            "text-app-muted hover:bg-card-opaque hover:text-primary-title",
            isExpanded
              ? "mx-2 h-10 px-3 gap-3"
              : "mx-auto h-11 w-11 justify-center",
          )}
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarImage src="" alt="Foto de perfil" />
            <AvatarFallback className="bg-card-opaque text-xs text-primary-title">
              {profileInitials}
            </AvatarFallback>
          </Avatar>
          <div
            className={cn(
              "flex flex-col overflow-hidden",
              "transition-[max-width,opacity] duration-300 ease-in-out",
              isExpanded ? "max-w-[140px] opacity-100" : "max-w-0 opacity-0",
            )}
          >
            <span className="truncate text-sm font-medium text-primary-title">
              {profileName}
            </span>
            <span className="truncate text-xs text-app-muted">
              {profileEmail}
            </span>
          </div>
        </div>

        {session ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                className={cn(
                  "flex items-center rounded-lg text-app-muted transition-colors duration-150",
                  "hover:bg-card-opaque hover:text-primary-title",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secundary-title/50",
                  isExpanded
                    ? "mx-2 h-9 w-[calc(100%-1rem)] px-3"
                    : "mx-auto h-11 w-11 justify-center",
                )}
                title="Sair"
                type="button"
              >
                <LogOut size={18} className="shrink-0" aria-hidden="true" />
                <span
                  className={cn(
                    "whitespace-nowrap text-sm font-medium",
                    "overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out",
                    isExpanded ? "ml-3 max-w-[140px] opacity-100" : "max-w-0 opacity-0",
                  )}
                >
                  Sair
                </span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border border-app-border bg-opaque-black text-primary-title shadow-2xl shadow-black/40">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-primary-title">
                  Sair da conta?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-secundary-title">
                  Você será levado para a tela de autenticação e precisará
                  entrar novamente para acessar sua agenda.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="border-app-border bg-input-opaque/55">
                <AlertDialogCancel className="border-app-border bg-transparent text-app-muted hover:bg-card-opaque hover:text-primary-title">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  onClick={handleLogout}
                >
                  Sair
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Link
            className={cn(
              "flex items-center rounded-lg text-app-muted transition-colors duration-150",
              "hover:bg-card-opaque hover:text-primary-title",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secundary-title/50",
              isExpanded
                ? "mx-2 h-9 px-3"
                : "mx-auto h-11 w-11 justify-center",
            )}
            href="/auth"
            title="Entrar"
          >
            <LogIn size={18} className="shrink-0" aria-hidden="true" />
            <span
              className={cn(
                "whitespace-nowrap text-sm font-medium",
                "overflow-hidden transition-[max-width,opacity] duration-300 ease-in-out",
                isExpanded ? "ml-3 max-w-[140px] opacity-100" : "max-w-0 opacity-0",
              )}
            >
              Entrar
            </span>
          </Link>
        )}
      </div>
    </aside>
  );
}
