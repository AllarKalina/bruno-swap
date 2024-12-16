import { tokenSwapAction } from "@/actions/tokenSwap-action";
import { useMutation } from "@tanstack/react-query";

export function useSwapMutation({
  onSuccess,
}: {
  onSuccess?: (data: any) => void;
}) {
  const mutation = useMutation({
    mutationFn: tokenSwapAction,
    onSuccess: (data) => {
      if (onSuccess) onSuccess(data);
    },
  });

  return mutation;
}
