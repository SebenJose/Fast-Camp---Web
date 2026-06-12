import { AuthGuard } from "@/features/auth/components";
import { AppSidebar } from "@/features/navigation";

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-primary-black">
        <AppSidebar />
        <div className="flex-1 pl-16 transition-[padding-left] duration-300">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
