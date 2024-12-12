"use server";

const USER_ID = "aecf2438-ade3-4563-ac48-aba3ddcf5d16";
const tokenAccountMap = new Map([
  ["EUR", "b5a20319b860aec9cef82a83a5365f7b"],
  ["BTC", "79a7fd33d231c855ea18a10e7c4ef986"],
  ["USDC", "cde14caee61a558331bc1d2e42f5bc1e"],
  ["USDT", "27a0e40daa1e46ea28bc42294d1bbc11"],
  ["ETH", "da41c756b86fc7b1d1f89bc479b67d46"],
  ["BNB", "cb3bc0c0705957d24dfe67ce064258c1"],
  ["POL", "2c2463056443560133570eb4fe1602b7"],
]);

type TParams = {
  tokenIn: string;
  tokenOut: string;
  amount: string;
};

export const tokenSwapAction = async (params: TParams) => {
  const { tokenIn, tokenOut, amount } = params;

  const ip = "146.255.182.198";
  const sourceAccountId = tokenAccountMap.get(tokenIn);
  const destinationAccountId = tokenAccountMap.get(tokenOut);

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/${USER_ID}/${sourceAccountId}/${destinationAccountId}/${Number(amount) * 100}/${ip}/swap`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
    },
  );

  console.log(response);

  return "tore";
};
