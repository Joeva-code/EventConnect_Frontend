"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { Mail } from "./icons";
import { getAuthUser, login, saveAuthToken, saveAuthUser, getCurrentUser, resendVerification } from "@/lib/api";

export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);
  const { form } = signInContent;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResendSuccess(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.error) {
      const message = String(result.error ?? "");
      if (message.toLowerCase().includes("verify your email")) {
        setError("Please verify your email before logging in. Check your inbox for the verification link.");
      } else {
        setError(result.error);
      }
      return;
    }

    if (result.data?.token) {
      saveAuthToken(result.data.token, remember);
      let user = result.data.data ?? getAuthUser();
      if (!user) {
        const me = await getCurrentUser();
        if (!me.error && me.data) {
          user = me.data;
        }
      }
      if (user) {
        saveAuthUser(user, remember);
      }
      router.push("/dashboard");
      return;
    }

    // If backend uses cookie-based auth and doesn't return a token,
    // try fetching the current user (with credentials included).
    if (!result.error) {
      const me = await getCurrentUser();
      if (!me.error && me.data) {
        saveAuthUser(me.data, remember);
        router.push("/dashboard");
        return;
      }
    }

    setError(result.error ?? result.data?.message ?? "Unable to sign in. Please try again.");
  }

  async function handleResendVerification() {
    setResendSuccess(null);
    setError(null);
    setIsSubmitting(true);
    const result = await resendVerification(email);
    setIsSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResendSuccess(result.data?.message ?? "Verification email sent. Please check your inbox.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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

      <PasswordField
        label={form.password.label}
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
      />

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {resendSuccess ? <p className="text-sm font-medium text-emerald-700">{resendSuccess}</p> : null}

      {error && error.toLowerCase().includes("verify your email") ? (
        <button
          type="button"
          onClick={handleResendVerification}
          disabled={isSubmitting}
          className="w-full rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Sending..." : "Resend verification email"}
        </button>
      ) : null}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 text-sm">
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
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Signing in…" : form.submit}
      </button>

      <p className="text-center text-sm text-slate-500">
        {form.footer.prompt}{" "}
        <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
          {form.footer.cta}
        </Link>
      </p>
    </form>
  );
}
