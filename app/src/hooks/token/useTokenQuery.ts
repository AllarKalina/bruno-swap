import { useQuery } from "@tanstack/react-query";

export function useTokenQuery({
  onFetch,
}: {
  onFetch: (data: string[]) => void;
}) {
  const query = useQuery<string[]>({
    queryKey: ["tokens"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/token`,
      ).then((res) => res.json());
      onFetch(response.data);
      return response.data;
    },
    refetchInterval: 5000,
    retry: false,
  });

  return query;
}
