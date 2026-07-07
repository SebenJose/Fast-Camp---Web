"use client";

import { useState } from "react";
import { ForgotPasswordRequestCard } from "./ForgotPasswordRequestCard";
import { ForgotPasswordVerifyCard } from "./ForgotPasswordVerifyCard";
import { ForgotPasswordResetCard } from "./ForgotPasswordResetCard";
import { ForgotPasswordSuccessCard } from "./ForgotPasswordSuccessCard";

type Step = "request" | "verify" | "reset" | "success";

function assertNever(value: never): never {
  throw new Error(`Etapa de recuperação inválida: ${value}`);
}

export function ForgotPasswordFormSwitcher() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const handleRequestCode = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("verify");
  };

  const handleVerifyCode = (submittedCode: string) => {
    setCode(submittedCode);
    setStep("reset");
  };

  const handleResetPassword = (submittedPassword: string) => {
    if (!code || !submittedPassword) {
      return;
    }

    setStep("success");
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
