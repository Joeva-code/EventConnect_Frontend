"use client";

import { useState } from "react";
import Link from "next/link";
import { TextField } from "./TextField";
import { PasswordField } from "./PasswordField";
import { AccountTypeSelect } from "./AccountTypeSelect";
import { OrDivider } from "./OrDivider";
import { GoogleButton } from "./GoogleButton";
import { Mail, UserIcon } from "./icons";

export function SignUpForm() {
  const [agreed, setAgreed] = useState(false);

  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="mt-8 space-y-5"
    >
      <div className="grid grid-cols-2 gap-4">
        <TextField
          id="firstName"
          name="firstName"
          label="First Name"
          placeholder="John"
          autoComplete="given-name"
          icon={<UserIcon className="h-4.5 w-4.5" />}
          required
        />
        <TextField
          id="lastName"
          name="lastName"
          label="Last Name"
          placeholder="Doe"
          autoComplete="family-name"
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
        required
      />

      <AccountTypeSelect />

      <PasswordField label="Password" name="password" />
      <PasswordField
        label="Confirm Password"
        name="confirmPassword"
        placeholder="Confirm your password"
        autoComplete="new-password"
      />

      <label className="flex items-start gap-2.5 text-sm text-slate-600">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
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
        className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
      >
        Sign Up
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
