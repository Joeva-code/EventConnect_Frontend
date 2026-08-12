"use client";

import { InputHTMLAttributes, useId, useState } from "react";
import { Lock, Eye, EyeOff } from "./icons";

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
  autoComplete?: string;
  placeholder?: string;
};

export function PasswordField({
  label,
  name,
  autoComplete = "new-password",
  placeholder = "Enter your password",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();

  return (
    <div>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <Lock className="h-4.5 w-4.5" />
        </span>
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder=" "
          className="peer w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-slate-900 placeholder:text-transparent focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          {...props}
        />
        <label
          htmlFor={id}
          className="absolute left-4 top-3 text-xs text-slate-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:top-1 peer-focus:text-xs"
        >
          {label}
        </label>
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? (
            <EyeOff className="h-4.5 w-4.5" />
          ) : (
            <Eye className="h-4.5 w-4.5" />
          )}
        </button>
      </div>
    </div>
  );
}