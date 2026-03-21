"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { SurveyForm } from "@/app/components"

export default function FormsScreen() {
  const router = useRouter()

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center">
      <SurveyForm />

      <div className="animate-bounce-slow mt-10 text-center">
        <Button
          variant="link"
          onClick={() => router.push("/dashboard")}
          className="font-semibold text-primary"
        >
          Ver resultados atualizados no Dashboard →
        </Button>
      </div>
    </div>
  )
}
