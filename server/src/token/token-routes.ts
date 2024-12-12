import { Router } from "express";
import TokenController from "./token-controller.js";

const tokenRouter = Router();

tokenRouter.get("/api/tokens", TokenController.getAllTokens);
tokenRouter.get(
  "/api/tokens/:currency/pairs",
  TokenController.getCurrencyPairs
);
tokenRouter.get(
  "/api/tokens/:tokenIn/:tokenInAmount/price",
  TokenController.getTotalPrice
);
tokenRouter.get(
  "/api/tokens/:tokenIn/:tokenOut/:tokenAmount/:type/price/swap",
  TokenController.getSwapPrice
);
tokenRouter.post("/api/swap", TokenController.swapTokens);

export default tokenRouter;
