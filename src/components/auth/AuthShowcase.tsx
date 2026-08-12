import Image from "next/image";
import { Star, ShieldCheck, Wallet, Chat } from "../landing/icons";
import { Logo } from "@/components/branding/Logo";

const points = [
  { icon: ShieldCheck, text: "Every vendor is ID-verified" },
  { icon: Wallet, text: "Transparent pricing, no hidden fees" },
  { icon: Chat, text: "Message vendors directly, in one place" },
];

export function AuthShowcase() {
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-blue-600 via-blue-700 to-indigo-900 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-12 lg:text-white">
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-blue-400/20 blur-3xl" />

      <Logo className="relative" />

      <div className="relative mt-12 max-w-md">
        <h2 className="text-4xl font-bold leading-tight tracking-tight">
          Plan unforgettable events with trusted vendors
        </h2>
        <p className="mt-4 text-lg text-blue-100">
          Join 12,000+ planners and 5,400+ vendors already booking with
          confidence on EventConnect.
        </p>

        <div className="mt-8 relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl">
          <Image
            src="/image.png"
            alt="EventConnect Maxify Integration"
            fill
            className="object-cover"
            sizes="50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-xs font-medium text-white/80">Powered by</p>
            <p className="text-sm font-bold text-white">Maxify Tickets</p>
          </div>
        </div>

        <ul className="mt-8 space-y-4">
          {points.map((point) => (
            <li key={point.text} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
                <point.icon className="h-4 w-4" />
              </span>
              <span className="text-blue-50">{point.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-16 max-w-sm rounded-2xl border border-white/15 bg-white/10 p-6 backdrop-blur">
        <div className="flex gap-1 text-amber-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4" />
          ))}
        </div>
        <p className="mt-3 italic text-blue-50">
          &ldquo;I planned my entire wedding through EventConnect. Every
          vendor was professional and the reviews were spot on.&rdquo;
        </p>
        <p className="mt-4 text-sm font-semibold text-white">
          Chidinma Eze
          <span className="ml-2 font-normal text-blue-200">
            Bride, Lagos
          </span>
        </p>
      </div>
    </div>
  );
}
