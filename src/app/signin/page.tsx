import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { signInContent } from "@/data/signin";

export const metadata: Metadata = {
  title: signInContent.meta.title,
  description: signInContent.meta.description,
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Compact header: logo left, switch-to-signup right */}
      <header className="w-full animate-fade-in">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              e
            </span>
            <span className="text-lg font-semibold text-slate-900">
              Event<span className="text-blue-600">Connect</span>
            </span>
          </Link>

          <Link
            href="/signup"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            Switch to sign up
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Centered login form with generous whitespace */}
      <main className="flex-1 flex items-center justify-center px-5 sm:px-6">
        <div className="w-full max-w-[440px] animate-fade-up py-12 sm:py-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {signInContent.heading}
            </h1>
            <p className="mt-2 text-slate-500">{signInContent.subheading}</p>
          </div>
          <SignInForm />
        </div>
      </main>
    </div>
  );
}
