"use client";

import { useState } from "react";

import { LoginFormCard } from "./LoginFormCard";
import { RegisterFormCard } from "./RegisterFormCard";

type AuthMode = "login" | "register";

export function AuthFormSwitcher() {
  const [mode, setMode] = useState<AuthMode>("login");

  if (mode === "register") {
    return <RegisterFormCard onShowLogin={() => setMode("login")} />;
  }

  return <LoginFormCard onShowRegister={() => setMode("register")} />;
}
