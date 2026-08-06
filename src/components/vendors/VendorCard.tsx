import Image from "next/image";
import { MapPin, Star } from "@/components/landing/icons";
import type { Vendor } from "@/data/vendors";

export function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={vendor.image}
          alt={vendor.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700">
          {vendor.category}
        </span>
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-slate-950">
          {vendor.name}
        </h3>

        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {vendor.location}
        </div>

        <div className="mt-3 flex items-center gap-1.5">
          <Star className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-slate-900">
            {vendor.rating.toFixed(1)}
          </span>
          <span className="text-sm text-slate-500">
            ({vendor.reviews} reviews)
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs text-slate-500">Starting at</p>
            <p className="text-sm font-semibold text-slate-950">
              {vendor.startingPrice}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            View Profile
          </button>
        </div>
      </div>
    </div>
  );
}
