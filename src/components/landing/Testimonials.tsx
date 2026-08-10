import { Star } from "./icons";

const testimonials = [
  {
    quote:
      "I planned my entire wedding through EventConnect. Every vendor was professional, the reviews were spot on, and I saved weeks of research.",
    name: "Chidinma Eze",
    role: "Bride, Lagos",
  },
  {
    quote:
      "As a corporate event manager, I book vendors consistently. The transparent pricing and direct messaging make my job so much easier.",
    name: "Tunde Balogun",
    role: "Corporate Event Manager, Abuja",
  },
  {
    quote:
      "Since joining as a vendor, EventConnect has become my biggest source of bookings. My portfolio does the selling for me.",
    name: "Amara Okafor",
    role: "Founder, Bloom & Co.",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Trusted by Planners & Vendors
        </h2>
        <p className="mt-3 text-lg text-slate-500">
          Thousands of successful events have been planned with confidence
          through EventConnect.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial.name}
            className="rounded-2xl border border-slate-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200"
          >
            <div className="flex gap-1 text-slate-950">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4" />
              ))}
            </div>
            <p className="mt-5 italic text-slate-600">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="font-semibold text-slate-950">
                {testimonial.name}
              </p>
              <p className="text-sm text-slate-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
