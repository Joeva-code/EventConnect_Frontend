import Image from "next/image";
import Link from "next/link";
import { Check } from "./icons";

const benefits = [
  "Reach thousands of active planners",
  "Showcase your portfolio",
  "Get verified to build instant trust",
  "Manage enquiries and bookings in one place",
];

export function VendorCta() {
  return (
    <section id="vendor-cta" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-bold tracking-tight text-slate-950">
            Grow your event business with EventConnect
          </h2>
          <p className="mt-4 text-lg text-slate-500">
            Join a marketplace built to help talented vendors get discovered,
            booked, and reviewed by planners who are ready to hire.
          </p>

          <ul className="mt-6 space-y-3">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="text-slate-700">{benefit}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Become a Vendor
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3.5 text-base font-semibold text-slate-900 transition-colors hover:bg-slate-50"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1638436684761-7e59f8a9072f?auto=format&fit=crop&w=1200&q=80"
            alt="Nigerian caterer's spread laid out for an event"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
