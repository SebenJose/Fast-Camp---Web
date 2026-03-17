import Link from "next/link"
import type { SidebarContentProps } from "./types"
import { Menu } from "lucide-react"

export function SidebarContent({ items, onItemClick }: SidebarContentProps) {
  return (
    <nav className="flex h-full w-full flex-col gap-4 overflow-hidden px-2 py-6">
      {/* Menu Icon + Logo/Brand */}
      <div className="mb-2 flex items-center px-2">
        <div className="flex w-8 shrink-0 items-center justify-center">
          <Menu size={24} className="text-sidebar-foreground" />
        </div>
        <h1 className="ml-4 whitespace-nowrap text-xl font-bold text-sidebar-foreground opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100">
          Dashboard
        </h1>
      </div>
      <div className="mb-6 px-2">
        <div className="h-px w-full bg-sidebar-border" />
      </div>

      {/* Navigation Items */}
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onItemClick}
              className="flex items-center rounded-lg p-2 text-sidebar-foreground transition-all hover:bg-sidebar-accent/20 active:bg-sidebar-accent/30"
            >
              <div className="flex w-8 shrink-0 items-center justify-center">
                <Icon size={20} className="text-sidebar-foreground" />
              </div>
              <span className="ml-4 whitespace-nowrap text-sm font-medium opacity-0 transition-opacity duration-200 group-hover/sidebar:opacity-100 md:opacity-0 md:group-hover/sidebar:opacity-100">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
