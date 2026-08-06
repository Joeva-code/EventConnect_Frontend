"use client";

import { useState } from "react";
import Link from "next/link";

const navLinks = [
  { label: "Categories", href: "#categories", internal: false },
  { label: "Why Us", href: "#why-us", internal: false },
  { label: "How It Works", href: "#how-it-works", internal: false },
  { label: "Vendors", href: "/vendors", internal: true },
  { label: "FAQ", href: "#faq", internal: false },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="pointer-events-none absolute inset-0 border-b border-slate-200 bg-white/90 backdrop-blur" />
      <div className="relative h-1 bg-amber-400" />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            e
          </span>
          <span className="text-lg font-semibold text-slate-900">
            Event<span className="text-blue-600">Connect</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) =>
            link.internal ? (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-slate-600 transition-colors hover:text-slate-900"
              >
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/signin"
            className="text-sm font-semibold text-slate-700 transition-colors hover:text-slate-900"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          aria-label="Toggle navigation menu"
          className="relative z-10 flex h-10 w-10 shrink-0 cursor-pointer touch-manipulation flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`pointer-events-none h-0.5 w-6 rounded-full bg-slate-900 transition-transform duration-300 ease-in-out ${
              open ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`pointer-events-none h-0.5 w-6 rounded-full bg-slate-900 transition-opacity duration-200 ease-in-out ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`pointer-events-none h-0.5 w-6 rounded-full bg-slate-900 transition-transform duration-300 ease-in-out ${
              open ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      <div
        className={`relative grid bg-white transition-[grid-template-rows] duration-300 ease-in-out md:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <nav className="flex flex-col gap-1 border-t border-slate-200 px-6 py-4">
            {navLinks.map((link) =>
              link.internal ? (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  {link.label}
                </a>
              ),
            )}

            <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-4">
              <Link
                href="/signin"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="rounded-full bg-blue-600 px-5 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
              >
                Sign Up
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
