import Image from "next/image";
import Link from "next/link";
import { Star } from "./icons";

export function Hero() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-4 w-4"
            >
              <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
              <path d="M9.5 12l1.75 1.75L14.5 10" />
            </svg>
            Trusted by 12,000+ Organizers
          </span>

          <h1 className="mt-6 text-5xl font-bold leading-[1.1] tracking-tight text-slate-950 sm:text-6xl">
            Plan Unforgettable Events with Trusted Vendors
          </h1>

          <p className="mt-6 max-w-md text-lg leading-8 text-slate-500">
            Discover vendors, book services, manage payments, and keep every
            detail of your event organized&mdash;all in one place.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/vendors"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              Find Vendors
            </Link>
            <a
              href="#vendor-cta"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-blue-600 px-6 py-3.5 text-base font-semibold text-blue-600 transition-colors hover:bg-blue-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                className="h-5 w-5"
              >
                <path d="M5 12h14" />
                <path d="M13 6l6 6-6 6" />
              </svg>
              Become a Vendor
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5" />
              ))}
            </div>
            <span className="text-sm text-slate-500">
              4.9/5 from 8,400+ reviews
            </span>
          </div>
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1551381891-678fe677d619?auto=format&fit=crop&w=1200&q=80"
            alt="Decorated marquee at a typical Nigerian event venue, with guests in aso-ebi"
            fill
            priority
            className="object-cover"
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>
      </div>
    </section>
  );
}
