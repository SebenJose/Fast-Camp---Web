"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Lock, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  AUTH_FORM_ERROR_CLASS_NAME,
  AUTH_ICON_INPUT_CLASS_NAME,
  AUTH_INLINE_LINK_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";
import { cn } from "@/shared/lib/utils";

import type { ForgotPasswordActionResult } from "../api/forgot-password-api";
import {
  type ForgotPasswordResetFormData,
  forgotPasswordResetSchema,
} from "../schemas/forgot-password-schemas";

type ForgotPasswordResetCardProps = {
  onSubmit: (
    password: string,
    passwordConfirmation: string,
  ) => Promise<ForgotPasswordActionResult>;
};

export function ForgotPasswordResetCard({
  onSubmit,
}: ForgotPasswordResetCardProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordResetFormData>({
    resolver: zodResolver(forgotPasswordResetSchema),
  });

  async function handleResetSubmit({
    password,
    passwordConfirmation,
  }: ForgotPasswordResetFormData) {
    setFormError(null);

    const result = await onSubmit(password, passwordConfirmation).catch(
      () => ({
        ok: false as const,
        message:
          "Não foi possível conectar ao serviço de recuperação de senha.",
      }),
    );

    if (!result.ok) {
      setFormError(result.message);
    }
  }

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
        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(handleResetSubmit)}
        >
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
                aria-describedby={
                  errors.password ? "new-password-error" : undefined
                }
                aria-invalid={Boolean(errors.password)}
                className={cn(
                  AUTH_ICON_INPUT_CLASS_NAME,
                  errors.password && "border-warning focus:border-warning",
                )}
                id="new-password"
                type="password"
                {...register("password")}
              />
            </div>
            {errors.password && (
              <p
                className="text-sm font-medium text-warning"
                id="new-password-error"
              >
                {errors.password.message}
              </p>
            )}
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
                aria-describedby={
                  errors.passwordConfirmation
                    ? "confirm-password-error"
                    : undefined
                }
                aria-invalid={Boolean(errors.passwordConfirmation)}
                className={cn(
                  AUTH_ICON_INPUT_CLASS_NAME,
                  errors.passwordConfirmation &&
                    "border-warning focus:border-warning",
                )}
                id="confirm-password"
                type="password"
                {...register("passwordConfirmation")}
              />
            </div>
            {errors.passwordConfirmation && (
              <p
                className="text-sm font-medium text-warning"
                id="confirm-password-error"
              >
                {errors.passwordConfirmation.message}
              </p>
            )}
          </div>

          {formError && (
            <p className={AUTH_FORM_ERROR_CLASS_NAME}>{formError}</p>
          )}

          <button
            className={AUTH_PRIMARY_ACTION_CLASS_NAME}
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Atualizando..." : "Atualizar senha"}
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
