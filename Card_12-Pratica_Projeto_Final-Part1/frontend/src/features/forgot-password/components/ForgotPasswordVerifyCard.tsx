"use client";

import { FormEvent, useState } from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import {
  AUTH_ICON_INPUT_CLASS_NAME,
  AUTH_INLINE_LINK_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AUTH_SECONDARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";

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
    <AuthFormCard
      title="Verificar código"
      description={
        <>
          Um código de verificação foi enviado para o e-mail{" "}
          <span className="font-semibold text-primary-title">
            {email || "xxxxx"}
          </span>
          .
        </>
      }
    >
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
                className={`${AUTH_ICON_INPUT_CLASS_NAME} tracking-[0.25em] font-mono text-lg`}
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
              className={AUTH_PRIMARY_ACTION_CLASS_NAME}
              type="submit"
            >
              Confirmar código
            </button>
            <button
              className={AUTH_SECONDARY_ACTION_CLASS_NAME}
              type="button"
              onClick={() => toast.info("Novo código enviado.")}
            >
              Reenviar código
            </button>
          </div>

          <div className="flex justify-center pt-2 w-full">
            <button
              className={`${AUTH_INLINE_LINK_CLASS_NAME} cursor-pointer bg-transparent border-0 mx-auto`}
              type="button"
              onClick={onBack}
            >
              <ArrowLeft className="h-4 w-4" />
              Alterar e-mail
            </button>
          </div>
        </form>
    </AuthFormCard>
  );
}
