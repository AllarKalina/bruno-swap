import { StatusCodes } from "http-status-codes";
import { Request, Response } from "express";
import TokenService from "./token-service.js";
import crypto from "crypto";

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
  req: Request<{
    userId: string;
    sourceAccountId: string;
    destinationAccountId: string;
    amount: string;
    ip: string;
  }>,
  res: Response<MyResponse<string>>
): Promise<void> => {
  const calcSig = (body: any) => {
    const hmac = crypto.createHmac("sha256", process.env.SANDBOX_API_SECRET);
    const time = Date.now().toString();

    hmac.update(time);
    hmac.update(process.env.METHOD);
    hmac.update(process.env.SWAP_ENDPOINT);

    const contentHash = crypto.createHash("md5");
    contentHash.update(JSON.stringify(body));

    hmac.update(contentHash.digest("hex"));

    const auth = `HMAC ${time}:${hmac.digest("hex")}`;

    return auth;
  };

  const body = {
    userId: req.params.userId,
    sourceAccountId: req.params.sourceAccountId,
    destinationAccountId: req.params.destinationAccountId,
    amount: (Number(req.params.amount) * 100).toString(),
    ip: req.params.ip,
  };

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
};

const TokenController = {
  getAllTokens,
  getCurrencyPairs,
  getTotalPrice,
  getSwapPrice,
  swapTokens,
};

export default TokenController;
