import { z } from "zod";

export const swapSchema = z.object({
  sellToken: z.string(),
  sellTokenAmount: z.string(),
  buyToken: z.string(),
  buyTokenAmount: z.string(),
  conversionType: z.enum(["EXACT_INPUT", "EXACT_OUTPUT"]),
});
