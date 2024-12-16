"use server";

type TParams = {
  tokenIn: string;
  tokenOut: string;
  amount: string;
};

export const tokenSwapAction = async (params: TParams) => {
  const { tokenIn, tokenOut, amount } = params;

  const body = {
    tokenIn,
    tokenOut,
    amount,
  };

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/swap`,
    {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();

  if (response.status !== 200) {
    return {
      error: true,
      message: data.err,
    };
  }

  return data;
};
