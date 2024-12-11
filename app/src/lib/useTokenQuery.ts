import { useQuery } from "@tanstack/react-query";

export function useTokenQuery({
  onFetch,
}: {
  onFetch: (data: string[]) => void;
}) {
  const query = useQuery<string[]>({
    queryKey: ["tokens"],
    queryFn: async () => {
      const response = await fetch("http://localhost:8080/api/tokens").then(
        (res) => res.json()
      );
      onFetch(response.data);
      return response.data;
    },
    refetchInterval: 1000000,
  });

  return query;
}
