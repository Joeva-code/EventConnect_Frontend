import Image from "next/image";
import { MapPin, Star } from "@/components/landing/icons";
import type { Vendor } from "@/data/vendors";

export function VendorCard({
  vendor,
  compact = false,
}: {
  vendor: Vendor;
  compact?: boolean;
}) {
  return (
    <div
      className={`group overflow-hidden rounded-[28px] border border-slate-100 bg-gradient-to-br from-white via-slate-50 to-white/95 transition hover:shadow-lg ${
        compact ? "shadow-sm" : "shadow"
      }`}
    >
      <div className={`relative w-full overflow-hidden ${compact ? "aspect-[3/2]" : "aspect-[4/3]"}`}>
        <Image
          src={vendor.image}
          alt={vendor.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span
          className={`absolute left-3 top-3 rounded-full bg-white/95 text-[11px] font-semibold text-slate-700 shadow-sm ${
            compact ? "px-2 py-0.5" : "px-3 py-1"
          }`}
        >
          {vendor.category}
        </span>
      </div>

      <div className={compact ? "p-4" : "p-5"}>
        <h3 className={compact ? "text-base font-semibold text-slate-950" : "text-lg font-semibold text-slate-950"}>
          {vendor.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{vendor.location}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1 text-slate-700">
            <Star className="h-4 w-4 text-amber-400" />
            <span className="font-semibold text-slate-900">{vendor.rating.toFixed(1)}</span>
          </span>
          <span>({vendor.reviews} reviews)</span>
        </div>

        <div className={`mt-4 flex items-center justify-between border-t border-slate-200 ${compact ? "pt-3" : "pt-4"}`}>
          <div>
            <p className="text-[11px] text-slate-500">Starting at</p>
            <p className="text-sm font-semibold text-slate-950">{vendor.startingPrice}</p>
          </div>
          <button
            type="button"
            className={`rounded-full bg-gradient-to-r from-blue-600 via-sky-600 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition duration-200 hover:from-blue-700 hover:via-sky-700 hover:to-blue-600 ${
              compact ? "min-w-[72px]" : "min-w-[88px]"
            }`}
          >
            View
          </button>
        </div>
      </div>
    </div>
  );
}
