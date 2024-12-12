import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";

type TSwapButton = {
  iconSize?: number;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const SwapButton: FC<TSwapButton> = ({ iconSize, className, ...props }) => {
  return (
    <button
      className={cn(
        "rounded-full border border-slate-200 bg-slate-100 p-2 transition-colors hover:bg-blue-50 disabled:hover:bg-slate-100",
        className,
      )}
      {...props}
    >
      <ChevronsUpDown
        size={iconSize}
        className={cn("text-blue-600", props.disabled && "text-slate-400")}
      />
    </button>
  );
};

export default SwapButton;
