import { Sidebar } from "@/app/components"

export default function HomeScreen() {
  return (
    <div className="flex h-screen w-full bg-secondary">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Mobile Header Spacing */}
        <div className="h-16 md:h-0" />
      </main>
    </div>
  )
}
