import type { InputHTMLAttributes, ReactNode } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  icon?: ReactNode;
};

export function TextField({ label, icon, id, ...props }: TextFieldProps) {
  return (
    <div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={id}
          placeholder=" "
          className={`peer w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-slate-900 placeholder:text-transparent focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${
            icon ? "pl-12 pr-4" : "px-4"
          }`}
          {...props}
        />
        <label
          htmlFor={id}
          className={`absolute left-4 top-1 text-xs text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs ${
            icon ? "peer-placeholder-shown:left-12 peer-focus:left-12" : ""
          }`}
        >
          {label}
        </label>
      </div>
    </div>
  );
}