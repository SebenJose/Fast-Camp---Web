"use client"

import { useState } from "react"
import {
  Menu,
  Home,
  LayoutDashboard,
  FileText,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "../ui"
import { SidebarContent } from "./SidebarContent"
import type { SidebarItem } from "./types"

const SIDEBAR_ITEMS: SidebarItem[] = [
  {
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Formulários",
    href: "/formularios",
    icon: FileText,
  },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  return (
    <>
      {/* Mobile Menu Trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="md:hidden">
          <button
            className="fixed top-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar shadow-lg hover:bg-sidebar/90 md:hidden"
            aria-label="Abrir menu"
          >
            <Menu size={24} className="text-sidebar-foreground" />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-56 bg-sidebar p-0">
          <SidebarContent
            items={SIDEBAR_ITEMS}
            onItemClick={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar - colapsada/expandida ao hover */}
      <aside className="group/sidebar hidden h-screen w-16 flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 hover:w-56 md:flex">
        <SidebarContent items={SIDEBAR_ITEMS} />
      </aside>
    </>
  )
}
