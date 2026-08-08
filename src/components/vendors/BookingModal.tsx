"use client";

import { FormEvent, useState } from "react";
import type { Vendor } from "@/data/vendors";
import { createBooking, getAuthToken } from "@/lib/api";

type BookingModalProps = {
  vendor: Vendor;
  onClose: () => void;
  onBooked: (vendorName: string) => void;
};

export function BookingModal({ vendor, onClose, onBooked }: BookingModalProps) {
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function clearError() {
    if (error) setError(null);
  }
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guests = Number(guestCount);
    if (!eventType || !eventDate || !location || !Number.isInteger(guests) || guests < 1) {
      setError("Please complete the event details and enter at least one guest.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const result = await createBooking(
      {
        vendorId: vendor.id,
        eventType,
        eventDate,
        guestCount: guests,
        eventLocation: location,
        budget: budget || undefined,
        specialNotes: message || undefined,
      },
      getAuthToken() ?? undefined,
    );
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    setIsSent(true);
    onBooked(vendor.name);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="booking-title">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-blue-600">Booking request</p>
            <h2 id="booking-title" className="mt-1 text-2xl font-semibold text-slate-950">Book {vendor.name}</h2>
            <p className="mt-2 text-sm text-slate-500">Share your event details. The vendor will review and respond to your request.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900" aria-label="Close booking form">✕</button>
        </div>

        {isSent ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-900">
            <p role="status" className="font-semibold">Booking request sent!</p>
            <p className="mt-2 text-sm leading-6">{vendor.name} can now review your event details and respond from their dashboard.</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">Done</button>
          </div>
        ) : <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Event type
              <input required value={eventType} onChange={(e) => { setEventType(e.target.value); clearError(); }} placeholder="e.g. Wedding" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Event date
            <input required type="date" min={new Date().toISOString().slice(0, 10)} value={eventDate} onChange={(e) => { setEventDate(e.target.value); clearError(); }} className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Number of guests
              <input required type="number" min="1" value={guestCount} onChange={(e) => { setGuestCount(e.target.value); clearError(); }} placeholder="e.g. 150" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Budget (optional)
              <input type="number" min="0" step="1" value={budget} onChange={(e) => { setBudget(e.target.value); clearError(); }} placeholder="e.g. 500000" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>
          </div>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Event location
            <input required value={location} onChange={(e) => { setLocation(e.target.value); clearError(); }} placeholder="City or venue address" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">Message (optional)
            <textarea value={message} onChange={(e) => { setMessage(e.target.value); clearError(); }} rows={3} placeholder="Tell the vendor about your plans and requirements." className="resize-none rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
          </label>
          {error ? <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
            <button disabled={isSubmitting} className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
              {isSubmitting ? "Sending request..." : "Send booking request"}
            </button>
          </div>
        </form>}
      </div>
    </div>
  );
}
