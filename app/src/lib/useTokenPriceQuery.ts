import { useQuery } from "@tanstack/react-query";

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
        `${process.env.API_URL}/api/tokens/${token}/${amount}/price`
      ).then((res) => res.json());
      return response.data;
    },
    enabled: !!token && !!amount,
    refetchInterval: 10000,
  });

  return query;
}
