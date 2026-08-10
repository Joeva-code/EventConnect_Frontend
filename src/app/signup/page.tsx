import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account — EventConnect",
  description: "Create your EventConnect account.",
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="w-full animate-fade-in">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
              e
            </span>
            <span className="text-lg font-semibold text-slate-900">
              Event<span className="text-blue-600">Connect</span>
            </span>
          </Link>
          <Link
            href="/signin"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          >
            Switch to sign in
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
      <main className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 text-left">
            <h1 className="text-3xl font-bold text-slate-950 mb-2">
              Get started with EventConnect
            </h1>
            <p className="text-slate-500">Get started in only a few minutes.</p>
          </div>
          <SignUpForm />
        </div>
      </main>
    </div>
  );
}