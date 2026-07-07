"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "../stores/auth-store";

import { SessionCheckSkeleton } from "./SessionCheckSkeleton";

type AuthGuardProps = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const session = useAuthStore((store) => store.session);
  const isCheckingSession = useAuthStore((store) => store.isCheckingSession);
  const hydrateSession = useAuthStore((store) => store.hydrateSession);

  useEffect(() => {
    void hydrateSession();
  }, [hydrateSession]);

  useEffect(() => {
    if (!isCheckingSession && !session) {
      router.replace("/auth");
    }
  }, [isCheckingSession, router, session]);

  if (isCheckingSession || !session) {
    return <SessionCheckSkeleton />;
  }

  return children;
}
