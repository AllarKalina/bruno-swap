"use client";

type TFormInput = {
  label: string;
  price?: string;
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const FormInput: React.FC<TFormInput> = ({ label, price, ...inputProps }) => {
  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={inputProps.name}
        className="cursor-pointer text-slate-500 text-sm tracking-wide"
      >
        {label}
      </label>
      <input
        id={inputProps.name}
        className="relative z-0 bg-transparent text-4xl font-medium text-slate-900 focus-visible:outline-none w-full"
        {...inputProps}
      />
      <span className="text-slate-500 text-sm tracking-wide">
        {price ?? "0.00"}€
      </span>
    </div>
  );
};

export default FormInput;
