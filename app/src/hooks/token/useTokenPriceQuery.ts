import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useTokenPriceQuery({
  token,
  amount,
}: {
  token: string;
  amount: string;
}) {
  const query = useQuery({
    queryKey: ["token-price", token, amount],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/price/${token}/${amount}`,
      ).then((res) => res.json());
      return response.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!token && !!amount,
    refetchInterval: 5000,
  });

  return query;
}
