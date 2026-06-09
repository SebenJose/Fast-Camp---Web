"use client";

import { useState } from "react";
import { ForgotPasswordRequestCard } from "./ForgotPasswordRequestCard";
import { ForgotPasswordVerifyCard } from "./ForgotPasswordVerifyCard";
import { ForgotPasswordResetCard } from "./ForgotPasswordResetCard";
import { ForgotPasswordSuccessCard } from "./ForgotPasswordSuccessCard";

type Step = "request" | "verify" | "reset" | "success";

export function ForgotPasswordFormSwitcher() {
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");

  const handleRequestCode = (submittedEmail: string) => {
    setEmail(submittedEmail);
    setStep("verify");
  };

  const handleVerifyCode = () => {
    setStep("reset");
  };

  const handleResetPassword = () => {
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
      return (
        <ForgotPasswordResetCard
          onSubmit={handleResetPassword}
        />
      );
    case "success":
      return <ForgotPasswordSuccessCard />;
    default:
      return null;
  }
}
