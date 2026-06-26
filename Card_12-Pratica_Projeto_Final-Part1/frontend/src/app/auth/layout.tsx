import { AuthGuestGuard } from "@/features/auth";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuestGuard>{children}</AuthGuestGuard>;
}
