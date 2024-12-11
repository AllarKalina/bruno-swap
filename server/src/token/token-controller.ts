import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import TokenService from "./token-service.js";
import { Worker } from "worker_threads";
import db from "db/connection.js";

export interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

type MyResponse<T> = { err: string } | { data: T };

const getAllTokens = async (
  _: Request,
  res: Response<MyResponse<string[]>>
): Promise<void> => {
  const worker = new Worker("./src/token/token-worker.js");

  try {
    const tokens = await TokenService.getAll();
    res.status(StatusCodes.OK).send({ data: tokens });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      err: error.message,
    });
  }

  // worker.on("message", async (tokens: string[]) => {
  //   const collection = await db.collection("rates");
  //   await collection.insertOne(tokens);
  // });

  worker.on("error", (err) => {
    console.error(err);
  });
};

const getTokenPairs = async (
  req: Request<{ tokenIn: string }>,
  res: Response<MyResponse<string[]>>
): Promise<void> => {
  const { tokenIn } = req.params;

  try {
    const tokenPairs = await TokenService.getPairs({ tokenIn });
    res.status(StatusCodes.OK).send({ data: tokenPairs });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err: error.message });
  }
};

const getTotalPrice = async (
  req: Request<{ tokenIn: string; tokenInAmount: string }>,
  res: Response<{ data: string } | { err: string }>
): Promise<void> => {
  const { tokenIn, tokenInAmount } = req.params;

  try {
    const price = await TokenService.getPriceInLocaleCurrency({
      tokenIn,
    });
    const totalPrice = TokenService.calculateTotalPrice({
      tokenInAmount,
      tokenPrice: price,
    });

    res.status(StatusCodes.OK).send({ data: totalPrice.toString() });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err: error.message });
  }
};

const getSwapPrice = async (
  req: Request<{
    tokenIn: string;
    tokenOut: string;
    tokenAmount: string;
    type: "EXACT_INPUT" | "EXACT_OUTPUT";
  }>,
  res: Response<MyResponse<string>>
): Promise<void> => {
  const { tokenIn, tokenOut, tokenAmount, type } = req.params;

  try {
    const pair = await TokenService.getPair({ tokenIn, tokenOut });
    const price = await TokenService.calculateSwapPrice({
      tokenIn,
      tokenAmount,
      tokenPair: pair,
      type,
    });
    res.send({ data: parseFloat(price.toFixed(8)).toString() });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err: error.message });
  }
};

const TokenController = {
  getAllTokens,
  getTokenPairs,
  getTotalPrice,
  getSwapPrice,
};

export default TokenController;
