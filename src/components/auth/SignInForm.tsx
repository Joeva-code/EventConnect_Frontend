"use client";

import { useState } from "react";
import Link from "next/link";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { OrDivider } from "./OrDivider";
import { GoogleButton } from "./GoogleButton";
import { Mail } from "./icons";
import { signInContent } from "@/data/signin";

export function SignInForm() {
  const [remember, setRemember] = useState(true);
  const { form } = signInContent;

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="mt-8 space-y-5"
    >
      <TextField
        id="email"
        name="email"
        type="email"
        label={form.email.label}
        placeholder={form.email.placeholder}
        autoComplete="email"
        icon={<Mail className="h-4.5 w-4.5" />}
        required
      />

      <PasswordField
        label={form.password.label}
        name="password"
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2.5 text-slate-600">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          {form.rememberMe}
        </label>
        <Link href="/forgot-password" className="font-medium text-blue-600 hover:underline">
          {form.forgotPassword}
        </Link>
      </div>

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
      >
        {form.submit}
      </button>

      <OrDivider text={form.orDivider} />
      <GoogleButton text={form.google} />

      <p className="text-center text-sm text-slate-500">
        {form.footer.prompt}{" "}
        <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
          {form.footer.cta}
        </Link>
      </p>
    </form>
  );
}
