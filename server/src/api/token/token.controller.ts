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

const USER_ID = "aecf2438-ade3-4563-ac48-aba3ddcf5d16";
const tokenAccountIdMap = new Map([
  ["EUR", "b5a20319b860aec9cef82a83a5365f7b"],
  ["BTC", "79a7fd33d231c855ea18a10e7c4ef986"],
  ["USDC", "cde14caee61a558331bc1d2e42f5bc1e"],
  ["USDT", "27a0e40daa1e46ea28bc42294d1bbc11"],
  ["ETH", "da41c756b86fc7b1d1f89bc479b67d46"],
  ["BNB", "cb3bc0c0705957d24dfe67ce064258c1"],
  ["POL", "2c2463056443560133570eb4fe1602b7"],
]);

const smallestUnitMap = new Map([
  ["ETH", 10 ** 18],
  ["POL", 10 ** 18],
  ["MATIC", 10 ** 18],
  ["BTC", 10 ** 8],
  ["BNB", 10 ** 8],
]);

const swapTokens = async (
  req: TypedRequestBody<{
    tokenIn: string;
    tokenOut: string;
    amount: string;
  }>,
  res: Response<
    TypedResponse<{
      debit: {
        currency?: string;
        amount?: string;
        amountFloat?: string;
      };
      credit: {
        currency?: string;
        amount?: string;
        amountFloat?: string;
      };
    }>
  >,
  next: NextFunction
) => {
  const { tokenIn, tokenOut, amount } = req.body;

  const sourceAccountId = tokenAccountIdMap.get(tokenIn);
  const destinationAccountId = tokenAccountIdMap.get(tokenOut);
  const smallestUnit = smallestUnitMap.get(tokenIn);

  const body = {
    userId: USER_ID,
    sourceAccountId: sourceAccountId,
    destinationAccountId: destinationAccountId,
    amount: smallestUnit
      ? (Number(amount) * smallestUnit).toString()
      : (Number(amount) * 100).toString(),
    ip: "127.0.0.1",
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
    const responseJson = await response.json();

    if (responseJson.errorCode) {
      throw new Error(responseJson.errorCode);
    }

    res.status(StatusCodes.OK).json({
      data: {
        debit: responseJson.order.debit,
        credit: responseJson.order.credit,
      },
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
