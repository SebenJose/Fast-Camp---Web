import { z } from "zod";

export const tokenTransactionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["debit", "recharge"]),
  amount: z.number().int().nonnegative(),
  balanceAfter: z.number().int().nonnegative(),
  createdAt: z.string(),
});

export const billingApiResponseSchema = z.object({
  message: z.string().nullish(),
  balance: z.number().int().nonnegative().nullish(),
  packages: z.array(z.number().int().positive()).nullish(),
  transactions: z.array(tokenTransactionSchema).nullish(),
});

export type TokenTransaction = z.infer<typeof tokenTransactionSchema>;
export type BillingApiResponse = z.infer<typeof billingApiResponseSchema>;

export interface Billing {
  balance: number;
  packages: number[];
  transactions: TokenTransaction[];
}
