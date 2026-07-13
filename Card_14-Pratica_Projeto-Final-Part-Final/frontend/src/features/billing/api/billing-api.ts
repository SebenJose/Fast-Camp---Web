import { parseApiResponse } from "@/shared/lib/parse-api-response";

import {
  billingApiResponseSchema,
  type Billing,
  type BillingApiResponse,
} from "../schemas/billing-schemas";

const BILLING_API_BASE_URL = "/api/billing";

export type RechargeResult =
  | { ok: true; billing: Billing }
  | { ok: false; message: string };

function toBilling(data: Partial<BillingApiResponse>): Billing | null {
  if (typeof data.balance !== "number") {
    return null;
  }

  return {
    balance: data.balance,
    packages: data.packages ?? [],
    transactions: data.transactions ?? [],
  };
}

export async function getBilling() {
  const response = await fetch(BILLING_API_BASE_URL).catch(() => null);

  if (!response?.ok) {
    return null;
  }

  return toBilling(
    await parseApiResponse(response, billingApiResponseSchema),
  );
}

export async function rechargeTokens(
  amount: number,
): Promise<RechargeResult> {
  const response = await fetch(`${BILLING_API_BASE_URL}/recharge`, {
    body: JSON.stringify({ amount }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  }).catch(() => null);

  if (!response) {
    return {
      ok: false,
      message: "Não foi possível conectar ao serviço de cobrança.",
    };
  }

  const data = await parseApiResponse(response, billingApiResponseSchema);
  const billing = toBilling(data);

  if (!response.ok || !billing) {
    return {
      ok: false,
      message: data.message ?? "Não foi possível realizar a recarga.",
    };
  }

  return { ok: true, billing };
}
