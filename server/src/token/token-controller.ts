import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import TokenService from "./token-service.js";
import { calcSig } from "utils.js";

interface TypedRequestBody<T> extends Express.Request {
  body: T;
}

type MyResponse<T> = { err: string } | { data: T };

const getAllTokens = async (
  _: Request,
  res: Response<MyResponse<string[]>>
): Promise<void> => {
  try {
    const tokens = TokenService.getAllCurrencies();
    res.status(StatusCodes.OK).send({ data: tokens });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      err: error.message,
    });
  }
};

const getCurrencyPairs = async (
  req: Request<{ currency: string }>,
  res: Response<MyResponse<string[]>>
): Promise<void> => {
  const { currency } = req.params;

  try {
    const tokenPairs = await TokenService.getPairs({ currency });
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
    const tokenPair = await TokenService.getPair({ tokenIn, tokenOut });
    const price = TokenService.calculateSwapPrice({
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
  res: Response<MyResponse<string>>
): Promise<void> => {
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
      Authorization: calcSig(body),
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
    const data = await response.json();

    res.status(StatusCodes.OK).send({ data });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ err: error.message });
  }
};

const TokenController = {
  getAllTokens,
  getCurrencyPairs,
  getTotalPrice,
  getSwapPrice,
  swapTokens,
};

export default TokenController;
