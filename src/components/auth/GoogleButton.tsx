"use client";

import { useState } from "react";
import { Google } from "./icons";
import { GOOGLE_AUTH_URL } from "@/lib/api";

export function GoogleButton({ text = "Continue with Google" }: { text?: string }) {
  const [signingIn, setSigningIn] = useState(false);

  function handleClick() {
    setSigningIn(true);
    window.location.assign(GOOGLE_AUTH_URL);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={signingIn}
      className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      <Google className="h-5 w-5" />
      {signingIn ? "Signing in…" : text}
    </button>
  );
}