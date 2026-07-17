"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { Mail, ArrowLeft } from "lucide-react";
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
  type ForgotPasswordRequestFormData,
  forgotPasswordRequestSchema,
} from "../schemas/forgot-password-schemas";

type ForgotPasswordRequestCardProps = {
  initialEmail: string;
  onSubmit: (email: string) => Promise<ForgotPasswordActionResult>;
};

export function ForgotPasswordRequestCard({
  initialEmail,
  onSubmit,
}: ForgotPasswordRequestCardProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordRequestFormData>({
    defaultValues: {
      email: initialEmail,
    },
    resolver: zodResolver(forgotPasswordRequestSchema),
  });

  async function handleRequestSubmit({ email }: ForgotPasswordRequestFormData) {
    setFormError(null);

    const result = await onSubmit(email).catch(() => ({
      ok: false as const,
      message: "Não foi possível conectar ao serviço de recuperação de senha.",
    }));

    if (!result.ok) {
      setFormError(result.message);
    }
  }

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
        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(handleRequestSubmit)}
        >
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
                aria-describedby={errors.email ? "email-error" : undefined}
                aria-invalid={Boolean(errors.email)}
                className={cn(
                  AUTH_ICON_INPUT_CLASS_NAME,
                  errors.email && "border-warning focus:border-warning",
                )}
                id="email"
                type="email"
                placeholder="exemplo@email.com"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-sm font-medium text-warning" id="email-error">
                {errors.email.message}
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
            {isSubmitting ? "Enviando..." : "Enviar código"}
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
