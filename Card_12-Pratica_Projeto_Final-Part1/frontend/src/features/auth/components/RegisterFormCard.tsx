"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  AUTH_FORM_ERROR_CLASS_NAME,
  AUTH_INPUT_CLASS_NAME,
  AUTH_PRIMARY_ACTION_CLASS_NAME,
  AuthFormCard,
} from "@/shared/components/auth-form";
import { cn } from "@/shared/lib/utils";

import { type RegisterFormData, registerSchema } from "../schemas/auth-schemas";
import { useAuthStore } from "../stores/auth-store";

type RegisterFormCardProps = {
  onShowLogin: () => void;
};

export function RegisterFormCard({ onShowLogin }: RegisterFormCardProps) {
  const router = useRouter();
  const registerUser = useAuthStore((store) => store.register);
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setFormError(null);

    const result = await registerUser(data).catch(() => ({
      ok: false as const,
      message: "Não foi possível conectar ao serviço de autenticação.",
    }));

    if (!result.ok) {
      setFormError(result.message);
      return;
    }

    toast.success(`Conta criada. Bem-vindo, ${result.session.name}.`);
    router.push("/");
  }

  return (
    <AuthFormCard
      title="Crie sua conta"
      description={
        <>
          Monte sua primeira semana e comece a organizar sua rotina com mais
          clareza.
        </>
      }
    >
        <div className="grid rounded-2xl bg-primary-black p-1">
          <div className="grid grid-cols-2 gap-1">
            <button
              className="rounded-xl px-4 py-4 text-sm font-semibold text-secundary-title"
              disabled={isSubmitting}
              onClick={onShowLogin}
              type="button"
            >
              Login
            </button>
            <button
              className="rounded-xl bg-opaque-black px-4 py-4 text-sm font-semibold text-app-foreground"
              type="button"
            >
              Cadastro
            </button>
          </div>
        </div>

        <form
          className="mt-8 space-y-5"
          noValidate
          onSubmit={handleSubmit(onSubmit, () => setFormError(null))}
        >
          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-name"
            >
              Nome
            </label>
            <input
              aria-describedby={errors.name ? "register-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              className={cn(
                AUTH_INPUT_CLASS_NAME,
                errors.name
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-name"
              type="text"
              {...registerField("name")}
            />
            {errors.name && (
              <p
                className="text-sm font-medium text-warning"
                id="register-name-error"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-email"
            >
              E-mail
            </label>
            <input
              aria-describedby={errors.email ? "register-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className={cn(
                AUTH_INPUT_CLASS_NAME,
                errors.email
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-email"
              type="email"
              {...registerField("email")}
            />
            {errors.email && (
              <p
                className="text-sm font-medium text-warning"
                id="register-email-error"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-password"
            >
              Senha
            </label>
            <input
              aria-describedby={errors.password ? "register-password-error" : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="new-password"
              className={cn(
                AUTH_INPUT_CLASS_NAME,
                errors.password
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-password"
              type="password"
              {...registerField("password")}
            />
            {errors.password && (
              <p
                className="text-sm font-medium text-warning"
                id="register-password-error"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label
              className="text-sm font-semibold text-secundary-title"
              htmlFor="register-password-confirmation"
            >
              Confirmar senha
            </label>
            <input
              aria-describedby={
                errors.passwordConfirmation
                  ? "register-password-confirmation-error"
                  : undefined
              }
              aria-invalid={Boolean(errors.passwordConfirmation)}
              autoComplete="new-password"
              className={cn(
                AUTH_INPUT_CLASS_NAME,
                errors.passwordConfirmation
                  ? "border-warning focus:border-warning"
                  : "border-card-opaque focus:border-app-foreground",
              )}
              id="register-password-confirmation"
              type="password"
              {...registerField("passwordConfirmation")}
            />
            {errors.passwordConfirmation && (
              <p
                className="text-sm font-medium text-warning"
                id="register-password-confirmation-error"
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
            {isSubmitting ? "Criando conta..." : "Criar conta"}
          </button>
        </form>
    </AuthFormCard>
  );
}
