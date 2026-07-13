import { parseApiResponse } from "@/shared/lib/parse-api-response";

import { forgotPasswordApiResponseSchema } from "../schemas/forgot-password-schemas";

export type ForgotPasswordActionResult =
  | {
      ok: true;
      message?: string;
    }
  | {
      ok: false;
      message: string;
    };

export type ForgotPasswordResetPayload = {
  email: string;
  code: string;
  password: string;
  passwordConfirmation: string;
};

const FORGOT_PASSWORD_API_BASE_URL = "/api/auth/forgot-password";

async function postForgotPassword(
  path: string,
  body: Record<string, string>,
  fallbackMessage: string,
): Promise<ForgotPasswordActionResult> {
  const response = await fetch(`${FORGOT_PASSWORD_API_BASE_URL}${path}`, {
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch(() => null);

  if (!response) {
    return {
      ok: false,
      message: "Não foi possível conectar ao serviço de recuperação de senha.",
    };
  }

  const data = await parseApiResponse(response, forgotPasswordApiResponseSchema);

  if (!response.ok) {
    return {
      ok: false,
      message: data.message ?? fallbackMessage,
    };
  }

  return {
    ok: true,
    message: data.message ?? undefined,
  };
}

export function requestPasswordResetCode(
  email: string,
): Promise<ForgotPasswordActionResult> {
  return postForgotPassword(
    "/request",
    { email },
    "Não foi possível enviar o código de recuperação.",
  );
}

export function verifyPasswordResetCode(
  email: string,
  code: string,
): Promise<ForgotPasswordActionResult> {
  return postForgotPassword(
    "/verify",
    { code, email },
    "Não foi possível validar o código.",
  );
}

export function resetPasswordWithCode(
  payload: ForgotPasswordResetPayload,
): Promise<ForgotPasswordActionResult> {
  return postForgotPassword(
    "/reset",
    { ...payload },
    "Não foi possível redefinir a senha.",
  );
}
