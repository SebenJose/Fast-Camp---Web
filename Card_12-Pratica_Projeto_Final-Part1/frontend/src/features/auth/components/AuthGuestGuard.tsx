"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "../stores/auth-store";

import { AuthPageSkeleton } from "./AuthPageSkeleton";

type AuthGuestGuardProps = {
  children: React.ReactNode;
};

export function AuthGuestGuard({ children }: AuthGuestGuardProps) {
  const router = useRouter();
  const session = useAuthStore((store) => store.session);
  const isCheckingSession = useAuthStore((store) => store.isCheckingSession);
  const hydrateSession = useAuthStore((store) => store.hydrateSession);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!isCheckingSession && session) {
      router.replace("/");
    }
  }, [isCheckingSession, router, session]);

  if (isCheckingSession || session) {
    return <AuthPageSkeleton />;
  }

  return children;
}
