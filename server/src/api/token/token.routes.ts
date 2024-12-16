import { Router } from "express";
import TokenController from "./token.controller.js";
import { validateRequest } from "middlewares.js";
import { z } from "zod";

const tokenRouter = Router();

tokenRouter.get("/", TokenController.getAll);
tokenRouter.get(
  "/pairs/:currency",
  validateRequest({
    params: z.object({
      currency: z.string().min(1),
    }),
  }),
  TokenController.getPairs
);
tokenRouter.get(
  "/price/:tokenIn/:tokenInAmount",
  validateRequest({
    params: z.object({
      tokenIn: z.string().min(1),
      tokenInAmount: z.string().min(1),
    }),
  }),
  TokenController.getTotalPrice
);
tokenRouter.get(
  "/price/swap/:tokenIn/:tokenOut/:tokenAmount/:type",
  validateRequest({
    params: z.object({
      tokenIn: z.string().min(1),
      tokenOut: z.string().min(1),
      tokenAmount: z.string().min(1),
      type: z.enum(["EXACT_INPUT", "EXACT_OUTPUT"]),
    }),
  }),
  TokenController.getSwapPrice
);
tokenRouter.post("/swap", TokenController.swapTokens);

export default tokenRouter;
