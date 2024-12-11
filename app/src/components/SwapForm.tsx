"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTokenQuery } from "@/hooks/token/useTokenQuery";
import { useTokenPairsQuery } from "@/hooks/token/useTokenPairsQuery";
import { swapSchema } from "@/lib/schemas";
import FormFieldWrapper from "./FormFieldWrapper";
import { useTokenPriceQuery } from "@/hooks/token/useTokenPriceQuery";
import { useSwapQuery } from "@/hooks/token/useSwapQuery";
import { ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "./ui/Form";
import { Input } from "./ui/Input";
import {
  DialogSelect,
  DialogSelectContent,
  DialogSelectItem,
  DialogSelectTrigger,
} from "./ui/DialogSelect";

const FORM_DEFAULT_VALUES: z.infer<typeof swapSchema> = {
  sellToken: "",
  sellTokenAmount: "",
  buyToken: "",
  buyTokenAmount: "",
  conversionType: "EXACT_INPUT",
};

export default function SwapForm() {
  const form = useForm<z.infer<typeof swapSchema>>({
    resolver: zodResolver(swapSchema),
    defaultValues: FORM_DEFAULT_VALUES,
  });

  const {
    getValues,
    resetField,
    watch,
    setValue,
    setFocus,
    control,
    handleSubmit,
  } = form;

  const tokenQuery = useTokenQuery({
    onFetch: (data) => {
      if (getValues("sellToken") === "")
        resetField("sellToken", { defaultValue: data[0] ?? "" });
    },
  });

  const tokenPairsQuery = useTokenPairsQuery({
    token: watch("sellToken"),
  });

  const sellTokenPriceQuery = useTokenPriceQuery({
    token: watch("sellToken"),
    amount: watch("sellTokenAmount"),
  });

  const buyTokenPriceQuery = useTokenPriceQuery({
    token: watch("buyToken"),
    amount: watch("buyTokenAmount"),
  });

  useSwapQuery({
    sellToken: watch("sellToken"),
    sellTokenAmount: watch("sellTokenAmount"),
    buyToken: watch("buyToken"),
    buyTokenAmount: watch("buyTokenAmount"),
    conversionType: watch("conversionType"),
    onFetch: (data) => {
      if (watch("conversionType") === "EXACT_INPUT") {
        setValue("buyTokenAmount", data);
      } else {
        setValue("sellTokenAmount", data);
      }
    },
  });

  const handleSwap = () => {
    const [sellToken, buyToken] = getValues(["sellToken", "buyToken"]);
    setValue("sellToken", buyToken);
    setValue("buyToken", sellToken);
  };

  const handleSellTokenChange = (e: string) => {
    // Case 1. Token to sell is the same as current buy token, swap tokens
    // Case 2. Token to sell is not current buy token, update sell token and get new token
    const [buyToken] = getValues(["sellToken", "buyToken"]);
    const shouldSwapTokens = e === buyToken;

    if (shouldSwapTokens) {
      handleSwap();
    } else {
      setValue("sellToken", e);
      setValue("buyToken", "");
      setValue("sellTokenAmount", "");
      setValue("buyTokenAmount", "");
    }
  };

  const onSubmit = (values: z.infer<typeof swapSchema>) => {
    console.log(values);
  };

  const renderTokenPrice = (
    data: any,
    amount: string,
    defaultValue: string,
  ) => {
    if (!data || amount === defaultValue) return "0.00";

    return parseFloat(data).toFixed(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <h2 className="my-2 text-2xl font-semibold text-slate-900">Swap</h2>
        <FormFieldWrapper onClick={() => setFocus("sellTokenAmount")}>
          <FormField
            control={control}
            name="sellTokenAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-500">From</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    autoFocus
                    placeholder="0.00"
                    className={cn(
                      "relative z-0 w-full border-none bg-transparent px-0 text-4xl font-medium text-slate-900 shadow-none focus-visible:outline-none focus-visible:ring-0",
                      sellTokenPriceQuery.isFetching && "text-slate-500",
                    )}
                    {...field}
                    onChange={(event) => {
                      const conversionType = getValues("conversionType");
                      if (conversionType === "EXACT_OUTPUT") {
                        setValue("conversionType", "EXACT_INPUT");
                      }
                      field.onChange(event);
                      if (
                        watch("sellTokenAmount") ===
                        FORM_DEFAULT_VALUES.sellTokenAmount
                      ) {
                        setValue(
                          "buyTokenAmount",
                          FORM_DEFAULT_VALUES.buyTokenAmount,
                        );
                      }
                    }}
                  />
                </FormControl>
                <FormDescription
                  className={cn(
                    "text-sm text-slate-500",
                    sellTokenPriceQuery.isFetching && "text-slate-400",
                  )}
                >
                  {`${renderTokenPrice(sellTokenPriceQuery.data, watch("sellTokenAmount"), FORM_DEFAULT_VALUES.sellTokenAmount)}€`}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="sellToken"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DialogSelect value={field.value}>
                    <DialogSelectTrigger>
                      {tokenPairsQuery.isPending ? (
                        <div className="h-[24px] w-[30px] animate-pulse rounded-xl bg-blue-200" />
                      ) : (
                        "Select token"
                      )}
                    </DialogSelectTrigger>
                    <DialogSelectContent>
                      {tokenQuery.isLoading && <p>Loading...</p>}
                      {tokenQuery.isError && <p>Something went wrong</p>}
                      {tokenQuery.data &&
                        tokenQuery.data.map((token) => (
                          <DialogSelectItem
                            key={token}
                            value={token}
                            disabled={token === field.value}
                            onClick={() => {
                              handleSellTokenChange(token);
                              field.onChange(token);
                            }}
                          >
                            {token}
                          </DialogSelectItem>
                        ))}
                    </DialogSelectContent>
                  </DialogSelect>
                </FormControl>
              </FormItem>
            )}
          />
        </FormFieldWrapper>
        <div className="relative z-10 -my-2">
          <button
            disabled={!watch("sellToken") || !watch("buyToken")}
            onClick={handleSwap}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-200 bg-slate-100 p-2 transition-colors hover:bg-blue-50 disabled:hover:bg-slate-100"
          >
            <ChevronsUpDown
              size={30}
              className={cn(
                "text-blue-600",
                (!watch("sellToken") || !watch("buyToken")) && "text-slate-500",
              )}
            />
          </button>
        </div>
        <FormFieldWrapper onClick={() => setFocus("buyTokenAmount")}>
          <FormField
            control={control}
            name="buyTokenAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm text-slate-500">To</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    autoFocus
                    placeholder="0.00"
                    className={cn(
                      "relative z-0 w-full border-none bg-transparent px-0 text-4xl font-medium text-slate-900 shadow-none focus-visible:outline-none focus-visible:ring-0",
                      buyTokenPriceQuery.isFetching && "text-slate-500",
                    )}
                    {...field}
                    onChange={(event) => {
                      const [conversionType, buyTokenAmount] = getValues([
                        "conversionType",
                        "buyTokenAmount",
                      ]);
                      if (conversionType === "EXACT_INPUT") {
                        setValue("conversionType", "EXACT_OUTPUT");
                      }
                      field.onChange(event);
                      if (
                        watch("buyTokenAmount") ===
                        FORM_DEFAULT_VALUES.buyTokenAmount
                      ) {
                        setValue(
                          "sellTokenAmount",
                          FORM_DEFAULT_VALUES.sellTokenAmount,
                        );
                      }
                    }}
                  />
                </FormControl>
                <FormDescription
                  className={cn(
                    "text-sm text-slate-500",
                    buyTokenPriceQuery.isFetching && "text-slate-400",
                  )}
                >
                  {`${renderTokenPrice(buyTokenPriceQuery.data, watch("buyTokenAmount"), FORM_DEFAULT_VALUES.buyTokenAmount)}€`}
                </FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="buyToken"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <DialogSelect value={field.value}>
                    <DialogSelectTrigger>
                      {tokenPairsQuery.isPending ? (
                        <div className="h-[24px] w-[96px] animate-pulse rounded-xl bg-blue-200" />
                      ) : (
                        "Select token"
                      )}
                    </DialogSelectTrigger>
                    <DialogSelectContent>
                      {tokenPairsQuery.isLoading && <p>Loading...</p>}
                      {tokenPairsQuery.isError && <p>Something went wrong</p>}
                      {tokenPairsQuery.data &&
                        tokenPairsQuery.data.map((token: string) => (
                          <DialogSelectItem
                            key={token}
                            value={token}
                            disabled={token === field.value}
                            onClick={() => {
                              field.onChange(token);
                            }}
                          >
                            {token}
                          </DialogSelectItem>
                        ))}
                    </DialogSelectContent>
                  </DialogSelect>
                </FormControl>
              </FormItem>
            )}
          />
        </FormFieldWrapper>
        <button className="my-2 rounded-xl bg-blue-600 p-4 font-medium text-slate-50 transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          Swap
        </button>
      </form>
    </Form>
  );
}
