"use client";

import { useState } from "react";
import { Plus } from "./icons";

const faqs = [
  {
    question: "How do I find the right vendor for my event?",
    answer:
      "Browse by category or search directly, then filter by budget, location, and ratings to shortlist vendors that match your vision.",
  },
  {
    question: "Are all vendors on EventConnect verified?",
    answer:
      "Yes. Every vendor completes ID verification before they're allowed to list a profile or accept bookings on EventConnect.",
  },
  {
    question: "Can I contact multiple vendors before making a decision?",
    answer:
      "Absolutely. You can message as many vendors as you'd like to compare quotes, availability, and services before booking.",
  },
  {
    question: "How do vendors join EventConnect?",
    answer:
      "Vendors sign up, complete verification, and build a profile with a portfolio and pricing before appearing in search results.",
  },
  {
    question: "Is EventConnect free for planners to use?",
    answer:
      "Yes, browsing vendors, messaging, and booking through EventConnect is completely free for event planners.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-lg text-slate-500">
          Everything you need to know before getting started.
        </p>
      </div>

      <div className="mt-10 space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className="rounded-2xl border border-slate-200 transition-all duration-300 hover:border-blue-200"
            >
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                aria-expanded={isOpen}
              >
                <span className="font-medium text-slate-950">
                  {faq.question}
                </span>
                <Plus
                  className={`h-5 w-5 shrink-0 text-slate-500 transition-transform duration-200 ${
                    isOpen ? "rotate-45" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <p className="px-6 pb-5 text-slate-500">{faq.answer}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
