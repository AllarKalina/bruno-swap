const FormInputWrapper = ({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) => {
  return (
    <div
      onClick={onClick}
      className="w-[550px] cursor-pointer items-center relative flex justify-between p-4 rounded-xl border-2 border-slate-200 hover:ring-2 hover:ring-slate-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-slate-500 transition-all"
    >
      {children}
    </div>
  );
};

export default FormInputWrapper;
