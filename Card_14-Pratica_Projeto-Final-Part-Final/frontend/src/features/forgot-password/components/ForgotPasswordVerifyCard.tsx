"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { KeyRound, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AUTH_FORM_ERROR_CLASS_NAME,
  AUTH_ICON_INPUT_CLASS_NAME,
  AUTH_INLINE_LINK_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AUTH_SECONDARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";
import { cn } from "@/shared/lib/utils";

import type { ForgotPasswordActionResult } from "../api/forgot-password-api";
import {
  type ForgotPasswordVerifyFormData,
  forgotPasswordVerifySchema,
} from "../schemas/forgot-password-schemas";

type ForgotPasswordVerifyCardProps = {
  email: string;
  onSubmit: (code: string) => Promise<ForgotPasswordActionResult>;
  onResend: () => Promise<ForgotPasswordActionResult>;
  onBack: () => void;
};

export function ForgotPasswordVerifyCard({
  email,
  onSubmit,
  onResend,
  onBack,
}: ForgotPasswordVerifyCardProps) {
  const [formError, setFormError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordVerifyFormData>({
    resolver: zodResolver(forgotPasswordVerifySchema),
  });

  const isBusy = isSubmitting || isResending;

  async function handleVerifySubmit({ code }: ForgotPasswordVerifyFormData) {
    setFormError(null);

    const result = await onSubmit(code).catch(() => ({
      ok: false as const,
      message: "Não foi possível conectar ao serviço de recuperação de senha.",
    }));

    if (!result.ok) {
      setFormError(result.message);
    }
  }

  async function handleResend() {
    setFormError(null);
    setIsResending(true);

    const result = await onResend()
      .catch(() => ({
        ok: false as const,
        message:
          "Não foi possível conectar ao serviço de recuperação de senha.",
      }))
      .finally(() => {
        setIsResending(false);
      });

    if (!result.ok) {
      toast.error(result.message);
    }
  }

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
        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(handleVerifySubmit)}
        >
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
                aria-describedby={errors.code ? "code-error" : undefined}
                aria-invalid={Boolean(errors.code)}
                className={cn(
                  AUTH_ICON_INPUT_CLASS_NAME,
                  "font-mono text-lg tracking-[0.25em]",
                  errors.code && "border-warning focus:border-warning",
                )}
                id="code"
                type="text"
                placeholder="000000"
                maxLength={6}
                {...register("code")}
              />
            </div>
            {errors.code && (
              <p className="text-sm font-medium text-warning" id="code-error">
                {errors.code.message}
              </p>
            )}
          </div>

          {formError && (
            <p className={AUTH_FORM_ERROR_CLASS_NAME}>{formError}</p>
          )}

          <div className="flex flex-col gap-3">
            <button
              className={AUTH_PRIMARY_ACTION_CLASS_NAME}
              disabled={isBusy}
              type="submit"
            >
              {isSubmitting ? "Confirmando..." : "Confirmar código"}
            </button>
            <button
              className={AUTH_SECONDARY_ACTION_CLASS_NAME}
              disabled={isBusy}
              type="button"
              onClick={handleResend}
            >
              {isResending ? "Reenviando..." : "Reenviar código"}
            </button>
          </div>

          <div className="flex justify-center pt-2 w-full">
            <button
              className={`${AUTH_INLINE_LINK_CLASS_NAME} cursor-pointer bg-transparent border-0 mx-auto`}
              disabled={isBusy}
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
