import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getBilling, rechargeTokens } from "../api/billing-api";

export const BILLING_QUERY_KEY = ["billing"] as const;

async function fetchBilling() {
  const billing = await getBilling();

  if (!billing) {
    throw new Error("Não foi possível carregar sua cobrança.");
  }

  return billing;
}

export function useBillingQuery() {
  return useQuery({
    queryFn: fetchBilling,
    queryKey: BILLING_QUERY_KEY,
  });
}

export function useRechargeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (amount: number) => {
      const result = await rechargeTokens(amount);

      if (!result.ok) {
        throw new Error(result.message);
      }

      return result.billing;
    },
    onSuccess: (billing) => {
      queryClient.setQueryData(BILLING_QUERY_KEY, billing);
    },
  });
}
