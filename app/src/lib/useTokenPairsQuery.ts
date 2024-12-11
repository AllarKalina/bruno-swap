import { useQuery } from "@tanstack/react-query";

export function useTokenPairsQuery({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ["token-pairs", token],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.API_BASE_URL}/api/tokens/${token}/pairs`
      ).then((res) => res.json());
      return response.data;
    },
    enabled: !!token,
  });

  return query;
}
