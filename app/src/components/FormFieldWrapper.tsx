const FormFieldWrapper = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className="relative flex max-w-[550px] cursor-pointer items-center justify-between rounded-xl border-2 border-slate-200 p-4 transition-all focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 hover:ring-2 hover:ring-blue-600"
    >
      {children}
    </div>
  );
};

export default FormFieldWrapper;
