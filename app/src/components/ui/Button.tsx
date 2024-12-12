import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, FC } from "react";

type TButton = {
  loading?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const Button: FC<TButton> = ({
  loading,
  disabled,
  className,
  children,
  ...props
}) => {
  return (
    <button
      disabled={loading || disabled}
      className={cn(
        "my-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 p-4 font-medium text-slate-50 shadow-sm transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" />}
      {!loading && children}
    </button>
  );
};

export default Button;
