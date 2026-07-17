"use client";

import { ArrowDownCircle, ArrowUpCircle, Coins } from "lucide-react";
import { toast } from "sonner";

import { QueryErrorState } from "@/shared/components/query-error-state";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { cn } from "@/shared/lib/utils";

import { useBillingQuery, useRechargeMutation } from "../hooks/use-billing";
import { type TokenTransaction } from "../schemas/billing-schemas";
import { BillingPageSkeleton } from "./BillingPageSkeleton";

function formatDateTime(isoDate: string) {
  return new Date(isoDate).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TransactionRow({ transaction }: { transaction: TokenTransaction }) {
  const isRecharge = transaction.type === "recharge";

  return (
    <li className="flex items-center gap-4 rounded-2xl border border-app-border bg-input-opaque/55 px-4 py-3">
      {isRecharge ? (
        <ArrowUpCircle
          size={22}
          className="shrink-0 text-emerald-400"
          aria-hidden="true"
        />
      ) : (
        <ArrowDownCircle
          size={22}
          className="shrink-0 text-amber-400"
          aria-hidden="true"
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-primary-title">
          {isRecharge ? "Recarga de tokens" : "Consumo no chat com a IA"}
        </p>
        <p className="text-xs text-app-muted">
          {formatDateTime(transaction.createdAt)}
        </p>
      </div>

      <div className="text-right">
        <p
          className={cn(
            "text-sm font-semibold tabular-nums",
            isRecharge ? "text-emerald-400" : "text-amber-400",
          )}
        >
          {isRecharge ? "+" : "−"}
          {transaction.amount.toLocaleString("pt-BR")}
        </p>
        <p className="text-xs tabular-nums text-app-muted">
          saldo {transaction.balanceAfter.toLocaleString("pt-BR")}
        </p>
      </div>
    </li>
  );
}

export function BillingPage() {
  const { data: billing, isPending, isError, refetch } = useBillingQuery();
  const rechargeMutation = useRechargeMutation();

  function handleRecharge(amount: number) {
    rechargeMutation.mutate(amount, {
      onError: (error) => toast.error(error.message),
      onSuccess: () =>
        toast.success(
          `Recarga de ${amount.toLocaleString("pt-BR")} tokens realizada!`,
        ),
    });
  }

  if (isPending) {
    return <BillingPageSkeleton />;
  }

  if (isError || !billing) {
    return (
      <QueryErrorState
        title="Não foi possível carregar sua cobrança."
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-3">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-app-muted">
            Tokens
          </p>
          <div>
            <h1 className="text-4xl font-semibold text-primary-title sm:text-5xl">
              Cobrança
            </h1>
            <p className="mt-3 max-w-2xl text-sm font-medium leading-6 text-secundary-title sm:text-base">
              Cada interação com a IA debita os tokens realmente consumidos.
              A recarga é simulada, sem custo real.
            </p>
          </div>
        </header>

        <section
          aria-label="Saldo e recarga"
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-[1fr_1.4fr]"
        >
          <Card className="gap-0 rounded-[24px] border border-app-border bg-opaque-black/80 p-0 ring-0">
            <CardHeader className="px-5 pt-5">
              <CardTitle className="flex items-center gap-2 text-primary-title">
                <Coins size={18} aria-hidden="true" />
                Saldo atual
              </CardTitle>
              <CardDescription className="text-secundary-title">
                Tokens disponíveis para conversar com a IA.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <p
                className={cn(
                  "text-5xl font-semibold tabular-nums",
                  billing.balance > 0 ? "text-primary-title" : "text-warning",
                )}
              >
                {billing.balance.toLocaleString("pt-BR")}
              </p>
              {billing.balance <= 0 && (
                <p className="mt-2 text-sm font-medium text-warning">
                  Saldo esgotado — recarregue para voltar a usar o chat.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="gap-0 rounded-[24px] border border-app-border bg-opaque-black/80 p-0 ring-0">
            <CardHeader className="px-5 pt-5">
              <CardTitle className="text-primary-title">Recarregar</CardTitle>
              <CardDescription className="text-secundary-title">
                Escolha um pacote para adicionar tokens ao seu saldo.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3 p-5">
              {billing.packages.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  disabled={rechargeMutation.isPending}
                  onClick={() => handleRecharge(amount)}
                  className="flex-1 basis-32 bg-secundary-title/20 py-6 text-base font-semibold text-secundary-title hover:bg-secundary-title/30"
                >
                  +{amount.toLocaleString("pt-BR")}
                </Button>
              ))}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="history-title">
          <h2
            id="history-title"
            className="mb-4 text-2xl font-semibold text-primary-title"
          >
            Histórico
          </h2>

          {billing.transactions.length === 0 ? (
            <p className="rounded-2xl border border-app-border bg-input-opaque/55 px-4 py-6 text-center text-sm text-app-muted">
              Nenhuma movimentação ainda. Converse com a IA ou faça uma
              recarga para começar.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {billing.transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
