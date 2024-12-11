"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

const DialogSelectContext = createContext<{
  value: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ value: "", open: false, setOpen: () => {} });

const DialogSelect = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<Element | null>(null);

  const childrenArray = Children.toArray(children);
  const trigger = childrenArray.find(isTrigger);

  const otherChildren = Children.toArray(children).filter(
    (child) => isValidElement(child) && child.type !== DialogSelectTrigger,
  );

  useEffect(() => {
    ref.current = document.body;
  }, []);

  if (!isValidElement(trigger)) return null;

  return (
    <DialogSelectContext.Provider value={{ value, open, setOpen }}>
      {trigger}
      {open && ref.current
        ? createPortal(
            <div
              className={
                open
                  ? "absolute inset-0 z-20 flex items-center justify-center"
                  : "hidden"
              }
            >
              <div
                onClick={() => setOpen(false)}
                className="absolute inset-0 z-0 bg-black/20"
              />
              {otherChildren}
            </div>,
            document.body,
          )
        : null}
    </DialogSelectContext.Provider>
  );
};

const isTrigger = (child: React.ReactNode): child is React.ReactElement => {
  return isValidElement(child) && child.type === DialogSelectTrigger;
};

const DialogSelectTrigger = ({ children }: { children: React.ReactNode }) => {
  const { value, setOpen } = useContext(DialogSelectContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="flex items-center justify-between gap-1 whitespace-nowrap rounded-full bg-blue-100 px-5 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 sm:text-base"
    >
      {value || children}
      <ChevronDown
        size={16}
        strokeWidth={3}
        className="shrink-0 text-blue-600"
      />
    </button>
  );
};

const DialogSelectContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative z-10 flex min-w-[300px] flex-col gap-2 rounded-xl bg-slate-100 p-6">
      <h2 className="my-2 text-2xl font-semibold text-slate-900">
        Select token
      </h2>
      {children}
    </div>
  );
};

const DialogSelectItem = ({
  onClick,
  value,
  disabled,
  children,
}: {
  onClick: () => void;
  value: string;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const { setOpen, value: formValue } = useContext(DialogSelectContext);
  const isActive = formValue === value;

  return (
    <li
      value={value}
      onClick={() => {
        if (disabled) return;
        onClick();
        setOpen(false);
      }}
      className={cn(
        "flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-4 py-2 font-medium text-slate-900 transition-colors",
        !isActive && "hover:bg-blue-100",
        isActive && "bg-blue-600 font-medium text-slate-100",
      )}
    >
      {children}
      {isActive && (
        <Check strokeWidth={3} size={20} className="text-slate-100" />
      )}
    </li>
  );
};

export {
  DialogSelect,
  DialogSelectTrigger,
  DialogSelectContent,
  DialogSelectItem,
};
