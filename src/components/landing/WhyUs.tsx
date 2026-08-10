import {
  ShieldCheck,
  StarOutline,
  Wallet,
  Chat,
  Sparkle,
  BadgeCheck,
} from "./icons";

const features = [
  {
    icon: ShieldCheck,
    title: "Vetted & Verified",
    description:
      "Every vendor passes through ID verification before they can list on EventConnect.",
  },
  {
    icon: StarOutline,
    title: "Real Reviews",
    description:
      "Ratings and photos come only from planners who actually booked, so you know what to expect.",
  },
  {
    icon: Wallet,
    title: "Transparent Pricing",
    description:
      "Compare clear packages and starting prices upfront—no hidden fees.",
  },
  {
    icon: Chat,
    title: "Direct Messaging",
    description:
      "Chat, share briefs, and confirm details with vendors right inside the platform.",
  },
  {
    icon: Sparkle,
    title: "Curated Portfolio",
    description:
      "See real work from real events so you can shortlist vendors that match your style.",
  },
  {
    icon: BadgeCheck,
    title: "Secure Bookings",
    description:
      "Protected payments and clear agreements keep both planners and vendors covered.",
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="mx-auto max-w-7xl px-6 py-20">
      <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          Why Planners Choose EventConnect
        </h2>
        <p className="mt-3 text-lg text-slate-500">
          We remove the guesswork from hiring vendors, making it easier to
          plan your event with confidence from start to finish.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border border-slate-200 p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-200"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <feature.icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-slate-950">
              {feature.title}
            </h3>
            <p className="mt-2 text-slate-500">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
