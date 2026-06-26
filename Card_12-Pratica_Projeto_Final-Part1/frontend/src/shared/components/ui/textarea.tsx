import * as React from "react"

import { cn } from "@/shared/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex w-full resize-none rounded-lg border border-app-border",
        "bg-input-opaque px-3 py-2.5 text-sm text-primary-title",
        "placeholder:text-app-muted outline-none",
        "transition-colors duration-150",
        "focus:border-secundary-title/50",
        "disabled:cursor-not-allowed disabled:opacity-40",
        "aria-invalid:border-destructive",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
