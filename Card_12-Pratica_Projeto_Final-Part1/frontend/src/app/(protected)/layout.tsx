import { AppSidebar } from "@/features/navigation";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen bg-primary-black">
      <AppSidebar />
      <main className="flex-1 pl-16 transition-[padding-left] duration-300">
        {children}
      </main>
    </div>
  );
}
