import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/shared/lib/utils";

const badgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border font-semibold transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        outline: "border-app-border bg-transparent text-app-muted",
        secondary: "border-app-border bg-input-opaque text-primary-title",
        inverted: "border-transparent bg-primary-title text-primary-black",
      },
      size: {
        default: "px-3 py-1 text-xs",
        sm: "px-2.5 py-0.5 text-xs",
        lg: "px-4 py-2 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
