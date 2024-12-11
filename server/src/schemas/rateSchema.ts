import { z } from "zod";

export const rateSchema = z.record(
  z.string(),
  z.object({
    price: z.string(),
    buy: z.string(),
    sell: z.string(),
    timestamp: z.number(),
    hTimestamp: z.string(),
    currency: z.string(),
  })
);
