import { db } from "db.js";
import { Worker } from "worker_threads";
import { Rates, Ticker } from "./token.model.js";
import { WithoutId } from "mongodb";

const LOCALE_CURRENCY = "EUR";
export const SUPPORTED_CURRENCIES = ["EUR", "USDC", "USDT"];

const currencyMap = new Map([
  ["Euros", "EUR"],
  ["USD Coin", "USDC"],
  ["Tether", "USDT"],
]);

const fetchTokens = async () => {
  const worker = new Worker("./src/api/token/token-worker.js");

  worker.on("message", (rates: Ticker) => {
    Rates.insertOne(rates);
  });

  worker.on("error", (err) => {
    console.error(err);
  });
};

/**
 * Gets all available currencies.
 */
const getAllCurrencies = async () => {
  // fetchTokens();
  const availableTokens = new Set<string>();
  const result: WithoutId<Ticker> = await Rates.findOne(
    {},
    { projection: { _id: 0 }, sort: { timestamp: -1 } }
  );

  // Iterate over all the tokens in the database
  Object.entries(result).map(([ticker, value]) => {
    const currency = currencyMap.get(value.currency);
    const currencyIndex = ticker.indexOf(currency);
    const token = ticker.slice(0, currencyIndex);

    // Add the token to the set of available tokens
    availableTokens.add(token);
    // If the currency is not already in the set, add it
    if (!availableTokens.has(currency)) availableTokens.add(currency);
  });

  return [...availableTokens];
};

/**
 * Retrieves token pairs that can be traded with the specified input token.
 */
const getPairs = async ({ currency }: { currency: string }) => {
  const tokenPairs = new Set<string>();
  const result = await Rates.findOne(
    {},
    { projection: { _id: 0 }, sort: { timestamp: -1 } }
  );

  // Iterate over the keys of the tokens object to find pairs
  Object.keys(result).map((token) => {
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
  tokenIn,
  tokenAmount,
  tokenPair,
  type,
}: {
  tokenIn: string;
  tokenAmount: string;
  tokenPair: any;
  type: "EXACT_INPUT" | "EXACT_OUTPUT";
}) => {
  const currency = currencyMap.get(tokenPair.currency);
  const swapDirection = tokenIn === currency;

  let swapPrice: number = 0;
  if (swapDirection) {
    if (type === "EXACT_INPUT") {
      swapPrice = Number(tokenAmount) / Number(tokenPair.buy);
    } else {
      swapPrice = Number(tokenAmount) * Number(tokenPair.buy);
    }
  } else {
    if (type === "EXACT_INPUT") {
      swapPrice = Number(tokenAmount) * Number(tokenPair.sell);
    } else {
      swapPrice = Number(tokenAmount) / Number(tokenPair.sell);
    }
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
