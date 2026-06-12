"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Lock, ArrowLeft } from "lucide-react";
import {
  AUTH_FORM_ERROR_CLASS_NAME,
  AUTH_ICON_INPUT_CLASS_NAME,
  AUTH_INLINE_LINK_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";

type ForgotPasswordResetCardProps = {
  onSubmit: (password: string) => void;
};

export function ForgotPasswordResetCard({
  onSubmit,
}: ForgotPasswordResetCardProps) {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== passwordConfirmation) {
      setFormError("As senhas não coincidem.");
      return;
    }

    onSubmit(password);
  };

  return (
    <AuthFormCard
      title="Nova Senha"
      description={
        <>
          Defina sua nova senha de acesso. Certifique-se de usar uma senha
          forte.
        </>
      }
    >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="new-password"
            >
              Nova Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-secundary-title">
                <Lock className="h-5 w-5" />
              </span>
              <input
                className={AUTH_ICON_INPUT_CLASS_NAME}
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
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="confirm-password"
            >
              Confirmar Nova Senha
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-secundary-title">
                <Lock className="h-5 w-5" />
              </span>
              <input
                className={AUTH_ICON_INPUT_CLASS_NAME}
                id="confirm-password"
                name="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>
          </div>

          {formError && (
            <p className={AUTH_FORM_ERROR_CLASS_NAME}>{formError}</p>
          )}

          <button
            className={AUTH_PRIMARY_ACTION_CLASS_NAME}
            type="submit"
          >
            Atualizar senha
          </button>

          <div className="flex justify-center pt-2 w-full">
            <Link
              className={`${AUTH_INLINE_LINK_CLASS_NAME} text-center mx-auto`}
              href="/auth"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancelar e voltar ao login
            </Link>
          </div>
        </form>
    </AuthFormCard>
  );
}
