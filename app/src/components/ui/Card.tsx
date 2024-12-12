import { cn } from "@/lib/utils";
import { FC } from "react";

type TCard = {
  className?: string;
  children: React.ReactNode;
};

const Card: FC<TCard> = ({ className, children }) => {
  return (
    <div className={cn("rounded-xl bg-slate-100 p-6 shadow-sm", className)}>
      {children}
    </div>
  );
};

export default Card;
