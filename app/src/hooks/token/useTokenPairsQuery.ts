import { useQuery } from "@tanstack/react-query";

export function useTokenPairsQuery({ token }: { token: string }) {
  const query = useQuery({
    queryKey: ["token-pairs", token],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token/pairs/${token}`,
      ).then((res) => res.json());
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });

  return query;
}
