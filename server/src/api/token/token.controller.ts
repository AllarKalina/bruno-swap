import { StatusCodes } from "http-status-codes";
import { NextFunction, Request, Response } from "express";
import TokenService from "./token.service.js";
import { calcSig } from "utils.js";

interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

type TypedResponse<T> = { err: string } | { data: T };

const getAll = async (
  _: Request,
  res: Response<TypedResponse<string[]>>,
  next: NextFunction
) => {
  try {
    const tokens = await TokenService.getAllCurrencies();
    res.status(StatusCodes.OK).json({ data: tokens });
  } catch (error) {
    next(error);
  }
};

const getPairs = async (
  req: Request<{ currency: string }>,
  res: Response<TypedResponse<string[]>>,
  next: NextFunction
) => {
  const { currency } = req.params;

  try {
    const tokenPairs = await TokenService.getPairs({ currency });
    res.status(StatusCodes.OK).json({ data: tokenPairs });
  } catch (error) {
    next(error);
  }
};

const getTotalPrice = async (
  req: Request<{ tokenIn: string; tokenInAmount: string }>,
  res: Response<{ data: string } | { err: string }>,
  next: NextFunction
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

    res.status(StatusCodes.OK).json({ data: totalPrice.toString() });
  } catch (error) {
    next(error);
  }
};

const getSwapPrice = async (
  req: Request<{
    tokenIn: string;
    tokenOut: string;
    tokenAmount: string;
    type: "EXACT_INPUT" | "EXACT_OUTPUT";
  }>,
  res: Response<TypedResponse<string>>
): Promise<void> => {
  const { tokenIn, tokenOut, tokenAmount, type } = req.params;

  try {
    const tokenPair = await TokenService.getPair({ tokenIn, tokenOut });
    const price = TokenService.calculateSwapPrice({
      tokenIn,
      tokenAmount,
      tokenPair,
      type,
    });
    res.send({ data: parseFloat(price.toFixed(8)).toString() });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err: error.message });
  }
};

const swapTokens = async (
  req: TypedRequestBody<{
    userId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    amount: string;
    ip: string;
  }>,
  res: Response<TypedResponse<string>>,
  next: NextFunction
) => {
  const { userId, sourceAccountId, destinationAccountId, amount, ip } =
    req.body;

  const body = {
    userId: userId,
    sourceAccountId: sourceAccountId,
    destinationAccountId: destinationAccountId,
    amount: (Number(amount) * 100).toString(),
    ip: ip,
  };

  try {
    const headers = {
      Authorization: calcSig({
        body,
        method: process.env.METHOD,
        endpoint: process.env.SWAP_ENDPOINT,
      }),
      "Api-Key": process.env.SANDBOX_API_KEY,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const f = {
      method: process.env.METHOD,
      headers,
      body: JSON.stringify(body),
    };

    const fullURL = `${process.env.API_BASE_URL}${process.env.SWAP_ENDPOINT}`;

    const response = await fetch(fullURL, f);

    // if (responseJson.errorCode) {
    //   throw new Error(responseJson.errorCode);
    // }

    res.status(StatusCodes.OK).json({
      data: "nice",
    });
  } catch (error) {
    res.status(400).json({ err: error.message });
  }
};

const TokenController = {
  getAll,
  getPairs,
  getTotalPrice,
  getSwapPrice,
  swapTokens,
};

export default TokenController;
