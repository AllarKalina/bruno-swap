"use client";

import { ChevronDown } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const FormComboboxContext = createContext<{
  value: string;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}>({ value: "", open: false, setOpen: () => {} });

const FormCombobox = ({
  value,
  trigger,
  children,
}: {
  value: string;
  trigger: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<Element | null>(null);

  useEffect(() => {
    ref.current = document.body;
  }, []);

  return (
    <FormComboboxContext.Provider value={{ value, open, setOpen }}>
      {trigger}
      {open && ref.current
        ? createPortal(
            <div
              className={
                open
                  ? "absolute z-20 inset-0 flex justify-center items-center"
                  : "hidden"
              }
            >
              <div
                onClick={() => setOpen(false)}
                className="absolute inset-0 z-0 bg-black/20"
              />
              {children}
            </div>,
            document.body
          )
        : null}
    </FormComboboxContext.Provider>
  );
};

const FormComboboxContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex flex-col gap-2 min-w-[300px] z-10 bg-white text-black p-4">
      <h2>Select a token</h2>
      {children}
    </div>
  );
};

const FormComboboxItem = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => {
  const { setOpen } = useContext(FormComboboxContext);

  return (
    <li
      onClick={() => {
        if (disabled) return;
        onClick();
        setOpen(false);
      }}
    >
      {children}
    </li>
  );
};

const FormComboboxTrigger = ({ children }: { children: React.ReactNode }) => {
  const { value, setOpen } = useContext(FormComboboxContext);

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="bg-slate-200 px-5 py-2 font-medium rounded-full text-slate-900 gap-2 flex justify-between items-center whitespace-nowrap hover:bg-slate-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
    >
      {value || children}
      <ChevronDown size={16} className="shrink-0" />
    </button>
  );
};

export {
  FormCombobox,
  FormComboboxContent,
  FormComboboxItem,
  FormComboboxTrigger,
};
