"use client";

import { useState } from "react";
import { toast } from "sonner";

import {
  requestPasswordResetCode,
  resetPasswordWithCode,
  verifyPasswordResetCode,
  type ForgotPasswordActionResult,
} from "../api/forgot-password-api";
import { ForgotPasswordRequestCard } from "./ForgotPasswordRequestCard";
import { ForgotPasswordVerifyCard } from "./ForgotPasswordVerifyCard";
import { ForgotPasswordResetCard } from "./ForgotPasswordResetCard";
import { ForgotPasswordSuccessCard } from "./ForgotPasswordSuccessCard";

type Step = "request" | "verify" | "reset" | "success";

const CODE_SENT_MESSAGE =
  "Se o e-mail existir, enviamos um código de recuperação.";

function assertNever(value: never): never {
  throw new Error(`Etapa de recuperação inválida: ${value}`);
}

export function ForgotPasswordFormSwitcher() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleRequestCode = async (
    submittedEmail: string,
  ): Promise<ForgotPasswordActionResult> => {
    const result = await requestPasswordResetCode(submittedEmail);

    if (result.ok) {
      setEmail(submittedEmail);
      setStep("verify");
      toast.info(result.message ?? CODE_SENT_MESSAGE);
    }

    return result;
  };

  const handleResendCode = async (): Promise<ForgotPasswordActionResult> => {
    const result = await requestPasswordResetCode(email);

    if (result.ok) {
      toast.info(result.message ?? CODE_SENT_MESSAGE);
    }

    return result;
  };

  const handleVerifyCode = async (
    submittedCode: string,
  ): Promise<ForgotPasswordActionResult> => {
    const result = await verifyPasswordResetCode(email, submittedCode);

    if (result.ok) {
      setCode(submittedCode);
      setStep("reset");
    }

    return result;
  };

  const handleResetPassword = async (
    password: string,
    passwordConfirmation: string,
  ): Promise<ForgotPasswordActionResult> => {
    const result = await resetPasswordWithCode({
      code,
      email,
      password,
      passwordConfirmation,
    });

    if (result.ok) {
      setStep("success");
      toast.success(result.message ?? "Senha redefinida com sucesso.");
    }

    return result;
  };

  switch (step) {
    case "request":
      return (
        <ForgotPasswordRequestCard
          initialEmail={email}
          onSubmit={handleRequestCode}
        />
      );
    case "verify":
      return (
        <ForgotPasswordVerifyCard
          email={email}
          onSubmit={handleVerifyCode}
          onResend={handleResendCode}
          onBack={() => setStep("request")}
        />
      );
    case "reset":
      return <ForgotPasswordResetCard onSubmit={handleResetPassword} />;
    case "success":
      return <ForgotPasswordSuccessCard />;
    default:
      return assertNever(step);
  }
}
