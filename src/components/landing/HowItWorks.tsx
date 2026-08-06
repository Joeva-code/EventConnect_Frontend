"use client";

import { useState } from "react";

type Tab = "planners" | "vendors";

const steps: Record<
  Tab,
  { title: string; description: string }[]
> = {
  planners: [
    {
      title: "Search & Shortlist",
      description:
        "Browse categories, filter by budget and location, and save vendors you love.",
    },
    {
      title: "Compare & Message",
      description:
        "Review portfolios, read verified reviews, and message vendors directly to get quotes.",
    },
    {
      title: "Book with Confidence",
      description:
        "Confirm details, agree on a package, and secure your booking through the platform.",
    },
  ],
  vendors: [
    {
      title: "Create Your Profile",
      description:
        "Showcase your portfolio, services, and pricing to stand out to planners.",
    },
    {
      title: "Get Discovered",
      description:
        "Appear in relevant category searches and receive enquiries from active planners.",
    },
    {
      title: "Get Booked & Paid",
      description:
        "Confirm bookings and receive secure payments directly through EventConnect.",
    },
  ],
};

const stats = [
  { value: "12,000+", label: "Active Planners" },
  { value: "5,400+", label: "Verified Vendors" },
  { value: "38,000+", label: "Events Booked" },
  { value: "4.9/5", label: "Average Vendor Rating" },
];

export function HowItWorks() {
  const [tab, setTab] = useState<Tab>("planners");

  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-950">
          How EventConnect Works
        </h2>
        <p className="mt-3 text-lg text-slate-500">
          A simple, transparent process—whether you&apos;re planning an event
          or growing your business.
        </p>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="inline-flex rounded-full border border-slate-200 p-1">
          <button
            type="button"
            onClick={() => setTab("planners")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === "planners"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            For Planners
          </button>
          <button
            type="button"
            onClick={() => setTab("vendors")}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
              tab === "vendors"
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            For Vendors
          </button>
        </div>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {steps[tab].map((step) => (
          <div
            key={step.title}
            className="rounded-2xl border border-slate-200 p-8"
          >
            <h3 className="text-lg font-semibold text-slate-950">
              {step.title}
            </h3>
            <p className="mt-2 text-slate-500">{step.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-8 rounded-3xl bg-blue-600 px-8 py-12 text-center text-white sm:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl font-bold sm:text-4xl">{stat.value}</p>
            <p className="mt-1 text-sm text-blue-100">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
