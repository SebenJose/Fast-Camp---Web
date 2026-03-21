import type { LucideIcon } from "lucide-react"

export interface SidebarItem {
  label: string
  href: string
  icon: LucideIcon
}

export interface SidebarContentProps {
  items: SidebarItem[]
  onItemClick?: () => void
}
