import { z } from "zod";

export const swapSchema = z.object({
  sellToken: z.string().min(1),
  sellTokenAmount: z.string().min(1),
  buyToken: z.string().min(1),
  buyTokenAmount: z.string().min(1),
  conversionType: z.enum(["EXACT_INPUT", "EXACT_OUTPUT"]),
});
