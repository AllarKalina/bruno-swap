import { tokenSwapAction } from "@/actions/tokenSwap-action";
import { useMutation } from "@tanstack/react-query";

export function useSwapMutation({ onSuccess }: { onSuccess?: () => void }) {
  const mutation = useMutation({
    mutationFn: tokenSwapAction,
    onSuccess: () => {
      if (onSuccess) onSuccess();
    },
  });

  return mutation;
}
