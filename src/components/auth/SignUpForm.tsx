"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { AccountTypeSelect } from "./AccountTypeSelect";
import { OrDivider } from "./OrDivider";
import { GoogleButton } from "./GoogleButton";
import { Mail, UserIcon } from "./icons";
import { getAuthUser, login, saveAuthToken, saveAuthUser, signup } from "@/lib/api";

export function SignUpForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState<"planner" | "vendor">("planner");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setIsSubmitting(true);
    const signupResult = await signup({
      firstName,
      lastName,
      email,
      password,
      accountType,
      termsAccepted,
    });

    if (signupResult.error) {
      setIsSubmitting(false);
      setError(signupResult.error);
      return;
    }

    const loginResult = await login(email, password);
    setIsSubmitting(false);

    if (loginResult.error) {
      setError(
        loginResult.error ||
          "Signup succeeded but automatic login failed. Please sign in manually."
      );
      return;
    }

    if (loginResult.data?.token) {
      saveAuthToken(loginResult.data.token, true);
      const user = loginResult.data.data ?? getAuthUser();
      if (user) {
        saveAuthUser(user, true);
      }
      router.push("/dashboard");
      return;
    }

    setError("Signup completed but we could not log you in automatically.");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="firstName"
          name="firstName"
          label="First Name"
          placeholder="John"
          autoComplete="given-name"
          icon={<UserIcon className="h-4.5 w-4.5" />}
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
          required
        />
        <TextField
          id="lastName"
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          autoComplete="family-name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          required
        />
      </div>

      <TextField
        id="email"
        name="email"
        type="email"
        label="Email"
        placeholder="Enter your email address"
        autoComplete="email"
        icon={<Mail className="h-4.5 w-4.5" />}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <AccountTypeSelect selected={accountType} onChange={setAccountType} />

      <PasswordField
        label="Password"
        name="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Confirm your password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
      />

      {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
      {message ? <p className="text-sm font-medium text-green-600">{message}</p> : null}

      <label className="flex items-start gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(event) => setTermsAccepted(event.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          required
        />
        <span>
          I agree to the{" "}
          <a href="#" className="font-medium text-blue-600 hover:underline">
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="font-medium text-blue-600 hover:underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Creating account…" : "Sign Up"}
      </button>

      <OrDivider />
      <GoogleButton />

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/signin" className="font-semibold text-blue-600 hover:underline">
          Sign In
        </Link>
      </p>
    </form>
  );
}
