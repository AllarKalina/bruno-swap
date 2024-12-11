import { useQuery } from "@tanstack/react-query";

export function useSwapQuery({
  sellToken,
  sellTokenAmount,
  buyToken,
  buyTokenAmount,
  conversionType,
  onFetch,
}: {
  sellToken: string;
  sellTokenAmount: string;
  buyToken: string;
  buyTokenAmount: string;
  conversionType: string;
  onFetch: (data: string) => void;
}) {
  const query = useQuery({
    queryKey: [
      "swap",
      sellToken,
      sellTokenAmount,
      buyToken,
      buyTokenAmount,
      conversionType,
    ],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.API_URL}/api/tokens/${sellToken}/${buyToken}/${
          conversionType === "EXACT_INPUT" ? sellTokenAmount : buyTokenAmount
        }/${conversionType}/swap`
      ).then((res) => res.json());
      onFetch(response.data);
      return response.data;
    },
    // Fix this
    enabled:
      (sellTokenAmount !== "" || conversionType !== "EXACT_INPUT") &&
      (buyTokenAmount !== "" || conversionType !== "EXACT_OUTPUT") &&
      sellToken !== "" &&
      buyToken !== "",

    refetchInterval: 10000,
  });

  return query;
}
