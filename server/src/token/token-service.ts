import db from "db/connection.js";
import { Worker } from "worker_threads";

const LOCALE_CURRENCY = "EUR";
const CURRENCIES = ["EUR", "USDC", "USDT"];

const fetchTokens = async () => {
  const worker = new Worker("./src/token/token-worker.js");

  worker.on("message", (tokens: string[]) => {
    const collection = db.collection("rates");
    collection.insertOne(tokens);
  });

  worker.on("error", (err) => {
    console.error(err);
  });
};

/**
 * Gets all available currencies.
 */
const getAllCurrencies = () => {
  fetchTokens();
  return CURRENCIES;
};

/**
 * Retrieves token pairs that can be traded with the specified input token.
 */
const getPairs = async ({ currency }: { currency: string }) => {
  const collection = db.collection("rates");

  // Fetch the most recent token data from the database
  const tokens = await collection.findOne(
    {},
    { projection: { _id: 0 }, sort: { timestamp: -1 } }
  );

  const tokenPairs = new Set<string>();

  // Iterate over the keys of the tokens object to find pairs
  Object.keys(tokens).map((token) => {
    const index = token.indexOf(currency);
    if (index === 0) {
      // If tokenIn is at the start, add the remaining part as a pair
      tokenPairs.add(token.slice(index + currency.length));
    } else if (index !== -1) {
      // If tokenIn is in the end, add the preceding part as a pair
      tokenPairs.add(token.slice(0, index));
    }
  });

  return [...tokenPairs];
};

/**
 * Retrieves the current price of the specified token in the locale currency.
 */
const getPriceInLocaleCurrency = async ({ tokenIn }: { tokenIn: string }) => {
  await fetchTokens();
  const collection = db.collection("rates");

  // Fetch the most recent token data from the database
  const tokens = await collection.findOne(
    {},
    { projection: { _id: 0 }, sort: { timestamp: -1 } }
  );

  if (tokenIn === LOCALE_CURRENCY) {
    return "1"; // If the token is the locale currency, return 1
  }

  // Find the pair with the specified token and the locale currency
  const pair = Object.entries(tokens).find(
    ([key]) => key === `${tokenIn}${LOCALE_CURRENCY}`
  );

  if (!pair) {
    throw new Error(`Pair not found: ${tokenIn}/${LOCALE_CURRENCY}.`);
  }

  const [_, { price }] = pair;

  return price;
};

/**
 * Retrieves the trading pair data for the specified input and output tokens.
 */
const getPair = async ({
  tokenIn: inputToken,
  tokenOut: outputToken,
}: {
  tokenIn: string;
  tokenOut: string;
}): Promise<any> => {
  const collection = db.collection("rates");

  // Fetch the most recent token data from the database
  const tokens = await collection.findOne(
    {},
    { projection: { _id: 0 }, sort: { timestamp: -1 } }
  );

  // Find the token pair that matches the input and output tokens
  const pair = Object.entries(tokens).find(
    ([ticker]) =>
      ticker === `${inputToken}${outputToken}` ||
      ticker === `${outputToken}${inputToken}`
  )?.[1];

  if (!pair) {
    throw new Error(`Pair not found: ${inputToken}/${outputToken}`);
  }

  return pair;
};

const calculateTotalPrice = ({
  tokenInAmount,
  tokenPrice,
}: {
  tokenInAmount: string;
  tokenPrice: string;
}) => {
  const tokenInAmountInLocaleCurrency =
    Number(tokenInAmount) * Number(tokenPrice);
  return tokenInAmountInLocaleCurrency;
};

const calculateSwapPrice = ({
  tokenAmount,
  tokenPair,
  type,
}: {
  tokenAmount: string;
  tokenPair: any;
  type: "EXACT_INPUT" | "EXACT_OUTPUT";
}) => {
  let swapPrice: number = 0;
  if (type === "EXACT_INPUT") {
    swapPrice = Number(tokenAmount) / Number(tokenPair.buy);
  } else {
    swapPrice = Number(tokenAmount) * Number(tokenPair.buy);
  }

  return swapPrice;
};

const TokenService = {
  fetchTokens,
  getAllCurrencies,
  getPairs,
  getPriceInLocaleCurrency,
  getPair,
  calculateTotalPrice,
  calculateSwapPrice,
};

export default TokenService;
