"use client";

import { FormEvent, useState } from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

type ForgotPasswordVerifyCardProps = {
  email: string;
  onSubmit: (code: string) => void;
  onBack: () => void;
};

export function ForgotPasswordVerifyCard({
  email,
  onSubmit,
  onBack,
}: ForgotPasswordVerifyCardProps) {
  const [code, setCode] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(code);
  };

  return (
    <Card className="w-full max-w-lg rounded-[28px] border-2 border-card-opaque bg-opaque-black p-8 text-primary-title shadow-2xl shadow-black/30 ring-0 sm:p-10">
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-primary-title sm:text-4xl">
          Verificar código
        </CardTitle>
        <CardDescription className="max-w-md text-base leading-7 text-secundary-title mt-2">
          Um código de verificação foi enviado para o e-mail{" "}
          <span className="font-semibold text-primary-title">
            {email || "xxxxx"}
          </span>
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="code"
            >
              Código de Verificação
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-secundary-title">
                <KeyRound className="h-5 w-5" />
              </span>
              <input
                className="h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque pl-12 pr-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20 tracking-[0.25em] font-mono text-lg"
                id="code"
                name="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              className="h-14 w-full rounded-2xl bg-app-foreground px-4 text-sm font-bold text-primary-black transition hover:bg-zinc-200 cursor-pointer"
              type="submit"
            >
              Confirmar código
            </button>
            <button
              className="h-14 w-full rounded-2xl border border-card-opaque bg-transparent px-4 text-sm font-semibold text-secundary-title transition hover:bg-white/5 hover:text-primary-title cursor-pointer"
              type="button"
              onClick={() => alert("Novo código enviado!")}
            >
              Reenviar código
            </button>
          </div>

          <div className="flex justify-center pt-2 w-full">
            <button
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-secundary-title underline underline-offset-4 transition hover:text-primary-title cursor-pointer bg-transparent border-0 mx-auto"
              type="button"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Alterar e-mail
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
