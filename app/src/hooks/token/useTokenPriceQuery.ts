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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tokens/${token}/${amount}/price`,
      ).then((res) => res.json());
      return response.data;
    },
    placeholderData: keepPreviousData,
    enabled: !!token && !!amount,
    refetchInterval: 10000,
  });

  return query;
}
