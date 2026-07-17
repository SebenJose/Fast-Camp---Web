import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

export const AUTH_FORM_CARD_CLASS_NAME =
  "w-full max-w-lg rounded-[28px] border-2 border-card-opaque bg-opaque-black p-8 text-primary-title shadow-2xl shadow-black/30 ring-0 sm:p-10";

export const AUTH_INPUT_CLASS_NAME =
  "h-14 w-full rounded-2xl border bg-input-opaque px-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:ring-2 focus:ring-white/20";

export const AUTH_ICON_INPUT_CLASS_NAME =
  "h-14 w-full rounded-2xl border border-card-opaque bg-input-opaque pl-12 pr-4 text-app-foreground outline-none transition placeholder:text-app-foreground/50 focus:border-app-foreground focus:ring-2 focus:ring-white/20";

export const AUTH_PRIMARY_ACTION_CLASS_NAME =
  "h-14 w-full rounded-2xl bg-app-foreground px-4 text-sm font-bold text-primary-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-70";

export const AUTH_SECONDARY_ACTION_CLASS_NAME =
  "h-14 w-full rounded-2xl border border-card-opaque bg-transparent px-4 text-sm font-semibold text-secundary-title transition hover:bg-white/5 hover:text-primary-title disabled:cursor-not-allowed disabled:opacity-70";

export const AUTH_INLINE_LINK_CLASS_NAME =
  "inline-flex items-center justify-center gap-2 text-sm font-semibold text-secundary-title underline underline-offset-4 transition hover:text-primary-title";

export const AUTH_FORM_ERROR_CLASS_NAME =
  "rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm font-medium text-warning";

type AuthFormCardProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  className?: string;
};

export function AuthFormCard({
  title,
  description,
  children,
  className,
}: AuthFormCardProps) {
  return (
    <Card className={cn(AUTH_FORM_CARD_CLASS_NAME, className)}>
      <CardHeader>
        <CardTitle className="text-3xl font-bold tracking-tight text-primary-title sm:text-4xl">
          {title}
        </CardTitle>
        <CardDescription className="mt-2 max-w-md text-base leading-7 text-secundary-title">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="mt-8">{children}</CardContent>
    </Card>
  );
}
