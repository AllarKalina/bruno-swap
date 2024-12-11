"use client";

import FormInput from "./form/FormInput";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTokenQuery } from "@/lib/useTokenQuery";
import { useTokenPairsQuery } from "@/lib/useTokenPairsQuery";
import { swapSchema } from "@/lib/schemas";
import FormInputWrapper from "./form/FormInputWrapper";
import {
  FormCombobox,
  FormComboboxContent,
  FormComboboxItem,
  FormComboboxTrigger,
} from "./form/FormCombobox";
import { useTokenPriceQuery } from "@/lib/useTokenPriceQuery";
import { useSwapQuery } from "@/lib/useSwapQuery";
import { ChevronsUpDown } from "lucide-react";

export default function SwapForm() {
  const {
    register,
    resetField,
    handleSubmit,
    watch,
    getValues,
    setValue,
    setFocus,
    control,
  } = useForm<z.infer<typeof swapSchema>>({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      sellToken: "",
      sellTokenAmount: "",
      buyToken: "",
      buyTokenAmount: "",
      conversionType: "EXACT_INPUT",
    },
  });

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

  {
    /*
    <FormInputWrapper>
      <FormInput/>
      <Controller
        name="sellToken"
        control={control}
        render={({ field }) => (
          <FormCombobox value={field.value}>
            <FormComboboxTrigger>
              <FormComboboxOption key={token} value={token}>
                Select token
              </FormComboboxOption>
            </FormComboboxTrigger>
            <FormComboboxContent>
              {tokenQuery.data.map((token) => (
                <FormComboboxItem 
                  key={token} 
                  value={token}
                  onClick={() => {
                    field.onChange(t);
                  }}>
                    {token}
                </FormComboboxItem>
              ))}
            </FormComboboxContent>
          </FormCombobox>
        )}
      />
    </FormInputWrapper>
    */
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <h2 className="text-slate-900 text-2xl font-semibold my-2">Swap</h2>
      <FormInputWrapper onClick={() => setFocus("sellTokenAmount")}>
        <Controller
          name="sellTokenAmount"
          control={control}
          render={({ field }) => (
            <FormInput
              label="From"
              type="number"
              step="any"
              lang="en"
              autoFocus
              placeholder="0.00"
              price={
                sellTokenPriceQuery.data &&
                parseFloat(sellTokenPriceQuery.data).toFixed(2)
              }
              {...field}
              onChange={(event) => {
                const conversionType = getValues("conversionType");
                if (conversionType === "EXACT_OUTPUT") {
                  setValue("conversionType", "EXACT_INPUT");
                }
                console.log(event.target.value);
                field.onChange(event);
              }}
            />
          )}
        />
        <Controller
          name="sellToken"
          control={control}
          render={({ field }) => (
            <FormCombobox
              value={field.value}
              trigger={
                <FormComboboxTrigger>
                  {tokenQuery.isLoading ? (
                    <div className="animate-pulse bg-slate-300 rounded-xl w-[50px] h-[20px]" />
                  ) : (
                    "Select token"
                  )}
                </FormComboboxTrigger>
              }
            >
              <FormComboboxContent>
                {tokenQuery.isLoading && (
                  <div className="animate-pulse w-[40px] h-hull" />
                )}
                {tokenQuery.isError && (
                  <div>Error: {tokenQuery.error.message}</div>
                )}
                {tokenQuery.data?.map((t: string) => (
                  <FormComboboxItem
                    key={t}
                    disabled={t === field.value}
                    onClick={() => {
                      handleSellTokenChange(t);
                      field.onChange(t);
                    }}
                  >
                    {t}
                  </FormComboboxItem>
                ))}
              </FormComboboxContent>
            </FormCombobox>
          )}
        />
      </FormInputWrapper>
      <div className="relative -my-2 z-10">
        <button
          disabled={!watch("sellToken") || !watch("buyToken")}
          onClick={handleSwap}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-100 border border-slate-200 p-2 rounded-full hover:bg-blue-50 transition-colors disabled:hover:bg-slate-100"
        >
          <ChevronsUpDown size={30} className="text-blue-600" />
        </button>
      </div>
      <FormInputWrapper onClick={() => setFocus("buyTokenAmount")}>
        <FormInput
          label="To"
          type="number"
          placeholder="0.00"
          pattern="([[0-9]+.*[0-9]*])"
          price={
            buyTokenPriceQuery.data &&
            parseFloat(buyTokenPriceQuery.data).toFixed(2)
          }
          {...register("buyTokenAmount", {
            onChange: (event) => {
              const conversionType = getValues("conversionType");
              if (conversionType === "EXACT_INPUT") {
                setValue("conversionType", "EXACT_OUTPUT");
              }
              setValue("buyTokenAmount", event.target.value);
            },
          })}
        />
        <Controller
          name="buyToken"
          control={control}
          render={({ field }) => (
            <FormCombobox
              value={field.value}
              trigger={
                <FormComboboxTrigger>
                  {tokenPairsQuery.isLoading ? (
                    <div className="animate-pulse bg-slate-300 rounded-xl w-[50px] h-[20px]" />
                  ) : (
                    "Select token"
                  )}
                </FormComboboxTrigger>
              }
            >
              <FormComboboxContent>
                {tokenPairsQuery.isLoading && (
                  <div className="animate-pulse w-[40px] h-hull" />
                )}
                {tokenPairsQuery.isError && (
                  <div>Error: {tokenPairsQuery.error.message}</div>
                )}
                {tokenPairsQuery.data?.map((t: string) => (
                  <FormComboboxItem
                    key={t}
                    onClick={() => {
                      field.onChange(t);
                    }}
                  >
                    {t}
                  </FormComboboxItem>
                ))}
              </FormComboboxContent>
            </FormCombobox>
          )}
        />
      </FormInputWrapper>
      <button className="bg-slate-900 text-slate-50 p-4 rounded-xl my-2 hover:bg-slate-950 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500">
        Swap
      </button>
    </form>
  );
}
