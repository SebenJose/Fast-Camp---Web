"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";
import {
  AUTH_ICON_INPUT_CLASS_NAME,
  AUTH_INLINE_LINK_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";

type ForgotPasswordRequestCardProps = {
  initialEmail: string;
  onSubmit: (email: string) => void;
};

export function ForgotPasswordRequestCard({
  initialEmail,
  onSubmit,
}: ForgotPasswordRequestCardProps) {
  const [email, setEmail] = useState(initialEmail);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(email);
  };

  return (
    <AuthFormCard
      title="Recuperar senha"
      description={
        <>
          Informe seu e-mail para receber um código de verificação para
          redefinir sua senha.
        </>
      }
    >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="email"
            >
              E-mail
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-secundary-title">
                <Mail className="h-5 w-5" />
              </span>
              <input
                className={AUTH_ICON_INPUT_CLASS_NAME}
                id="email"
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            className={AUTH_PRIMARY_ACTION_CLASS_NAME}
            type="submit"
          >
            Enviar código
          </button>

          <div className="flex justify-center pt-2 w-full">
            <Link
              className={`${AUTH_INLINE_LINK_CLASS_NAME} text-center mx-auto`}
              href="/auth"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o Login
            </Link>
          </div>
        </form>
    </AuthFormCard>
  );
}
