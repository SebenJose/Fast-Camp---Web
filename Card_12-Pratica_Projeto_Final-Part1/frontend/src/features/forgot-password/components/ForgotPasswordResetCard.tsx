"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type ForgotPasswordResetCardProps = {
  onSubmit: (password: string) => void;
};

export function ForgotPasswordResetCard({
  onSubmit,
}: ForgotPasswordResetCardProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      alert("As senhas não coincidem.");
      return;
    }
    onSubmit(password);
  };

  return (
    <Card className="w-full max-w-lg rounded-[28px] border-2 border-card-opaque bg-opaque-black p-8 text-primary-title shadow-2xl shadow-black/30 ring-0 sm:p-10">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-primary-title sm:text-4xl">
          Nova Senha
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-secundary-title mt-2">
          Defina sua nova senha de acesso. Certifique-se de usar uma senha forte.
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-secundary-title" htmlFor="new-password">
              Nova Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-secundary-title">
                <Lock className="h-5 w-5" />
              </span>
              <input
                className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque pl-12 pr-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
                id="new-password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-secundary-title" htmlFor="confirm-password">
              Confirmar Nova Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-secundary-title">
                <Lock className="h-5 w-5" />
              </span>
              <input
                className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque pl-12 pr-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20"
                id="confirm-password"
                name="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className="h-14 w-full rounded-2xl bg-app-foreground px-4 text-sm font-bold text-primary-black transition hover:bg-zinc-200 cursor-pointer"
            type="submit"
          >
            Atualizar senha
          </button>

          <div className="flex justify-center pt-2 w-full">
            <Link
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-secundary-title underline underline-offset-4 transition hover:text-primary-title text-center mx-auto"
              href="/auth"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar e voltar ao login
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
