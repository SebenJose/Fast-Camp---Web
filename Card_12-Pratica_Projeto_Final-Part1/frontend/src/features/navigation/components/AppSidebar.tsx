"use client";

import { BotMessageSquare, CalendarDays, LayoutDashboard } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { cn } from "@/shared/lib/utils";

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


export function AppSidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

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

      {/* Avatar do usuário */}
      <div
        className={cn(
          "flex items-center rounded-lg mb-3 transition-colors duration-150",
          "text-app-muted hover:bg-card-opaque hover:text-primary-title cursor-pointer",
          isExpanded
            ? "mx-2 h-10 px-3 gap-3"
            : "mx-auto h-11 w-11 justify-center",
        )}
      >
        <Avatar className="h-7 w-7 shrink-0">
          <AvatarImage src="" alt="Foto de perfil" />
          <AvatarFallback className="text-xs">US</AvatarFallback>
        </Avatar>
        <div
          className={cn(
            "flex flex-col overflow-hidden",
            "transition-[max-width,opacity] duration-300 ease-in-out",
            isExpanded ? "max-w-[120px] opacity-100" : "max-w-0 opacity-0",
          )}
        >
          <span className="whitespace-nowrap text-sm font-medium text-primary-title">
            Usuário
          </span>
          <span className="whitespace-nowrap text-xs text-app-muted">
            usuario@email.com
          </span>
        </div>
      </div>
    </aside>
  );
}
