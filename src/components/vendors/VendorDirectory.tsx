"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "@/components/landing/icons";
import { categories, type Category, type Vendor as StaticVendor } from "@/data/vendors";
import { getAuthToken, getAuthUser, getVendors } from "@/lib/api";
import { VendorCard } from "./VendorCard";
import { BookingModal } from "./BookingModal";

type Filter = "All" | Category;

export function VendorDirectory() {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");
  const [vendorList, setVendorList] = useState<StaticVendor[]>([]);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookingVendor, setBookingVendor] = useState<StaticVendor | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadVendors() {
      const result = await getVendors(getAuthToken() ?? undefined);
      if (result.error) {
        setBackendError(result.error);
        setVendorList([]);
      } else if (result.data) {
        setVendorList(result.data as StaticVendor[]);
      } else {
        setVendorList([]);
      }
      setIsLoading(false);
    }

    loadVendors();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return vendorList.filter((vendor) => {
      const matchesCategory = filter === "All" || vendor.category === filter;
      const matchesQuery =
        q.length === 0 ||
        vendor.name.toLowerCase().includes(q) ||
        vendor.location.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [filter, query, vendorList]);

  function startBooking(vendor: StaticVendor) {
    const user = getAuthUser();
    if (!user) {
      setBackendError("Please sign in as a planner before sending a booking request.");
      return;
    }
    if (user.role.toUpperCase() !== "PLANNER") {
      setBackendError("Only planner accounts can send booking requests.");
      return;
    }
    setBookingNotice(null);
    setBookingVendor(vendor);
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-400">
            <Search className="h-4.5 w-4.5" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search vendors or location"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
          />
        </div>

        <p className="text-sm text-slate-500">
          {isLoading ? "Loading vendors..." : `${filtered.length} vendor${filtered.length === 1 ? "" : "s"} found`}
        </p>
      </div>

      {backendError ? (
        <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
          {backendError}
        </div>
      ) : null}

      {bookingNotice ? <p role="status" className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-lg">{bookingNotice}</p> : null}

      <div className="mt-6 flex flex-wrap gap-2">
        {(["All", ...categories] as Filter[]).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setFilter(option)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              filter === option
                ? "bg-blue-600 text-white"
                : "border border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} onBook={startBooking} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-slate-950">
            No vendors match your search
          </p>
          <p className="mt-1 text-slate-500">
            Try a different category or search term.
          </p>
        </div>
      )}

      {bookingVendor ? (
        <BookingModal
          vendor={bookingVendor}
          onClose={() => setBookingVendor(null)}
          onBooked={(vendorName) => setBookingNotice(`Booking request sent to ${vendorName}. The vendor can now review it in their dashboard.`)}
        />
      ) : null}
    </div>
  );
}
