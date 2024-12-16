import { z } from "zod";
import { db } from "db.js";

export const tokenSchema = z.object({
  price: z.string(),
  buy: z.string(),
  sell: z.string(),
  timestamp: z.number(),
  hTimestamp: z.string(),
  currency: z.string(),
});

export const tickerSchema = z.record(z.string(), tokenSchema);
export type Token = z.infer<typeof tokenSchema>;
export type Ticker = z.infer<typeof tickerSchema>;
export const Rates = db.collection<Ticker>("rates");

export const transactionSchema = z.object({
  id: z.string(),
  order: z.object({
    id: z.string(),
    price: z.string(),
    type: z.enum(["buy"]),
    ticker: z.string(),
    debit: z.object({
      currency: z.string(),
      amountFloat: z.string(),
      amount: z.string(),
    }),
    credit: z.object({
      currency: z.string(),
      amountFloat: z.string(),
      amount: z.string(),
    }),
  }),
});

export type Transaction = z.infer<typeof transactionSchema>;

export type TransactionError = {
  message: string;
  errorCode: string;
};
