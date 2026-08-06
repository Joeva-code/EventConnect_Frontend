"use client";

import { useState } from "react";
import Link from "next/link";
import { TextField } from "./TextField";
import { Mail, ArrowLeft } from "./icons";
import { forgotPasswordContent } from "@/data/forgotPassword";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { form, success } = forgotPasswordContent;

  if (submitted) {
    return (
      <div className="mt-8 space-y-5">
        <h2 className="text-xl font-semibold text-slate-950">
          {success.heading}
        </h2>
        <p className="text-slate-500">
          {success.body} <span className="font-medium text-slate-700">{email}</span>
        </p>
        <Link
          href="/signin"
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          {success.backToSignIn}
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(true);
      }}
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
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <button
        type="submit"
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
      >
        {form.submit}
      </button>

      <Link
        href="/signin"
        className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        {form.backToSignIn}
      </Link>
    </form>
  );
}
