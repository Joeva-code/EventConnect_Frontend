"use client";

import { FormEvent, useState } from "react";
import { createEvent, getAuthToken, type Event } from "@/lib/api";

type CreateEventModalProps = {
  onClose: () => void;
  onCreated: (event: Event) => void;
};

export function CreateEventModal({ onClose, onCreated }: CreateEventModalProps) {
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  function clearError() {
    if (error) setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const guests = Number(guestCount);
    if (!name || !eventType || !eventDate || !location || !Number.isInteger(guests) || guests < 1) {
      setError("Please complete the event details and enter at least one guest.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const result = await createEvent(
      {
        name,
        eventType,
        eventDate: new Date(eventDate).toISOString(),
        location,
        guestCount: guests,
      },
      getAuthToken() ?? undefined,
    );
    setIsSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.data) {
      setIsCreated(true);
      onCreated(result.data);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-4 sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="create-event-title">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">
        {isCreated ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
            <h2 className="text-xl font-semibold text-emerald-700">Event created!</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{name} has been added to your events. You can now manage it from My Events.</p>
            <button type="button" onClick={onClose} className="mt-5 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Done</button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-blue-600">New event</p>
                <h2 id="create-event-title" className="mt-1 text-2xl font-semibold text-slate-950">Create an event</h2>
                <p className="mt-2 text-sm text-slate-500">Set up your event details. You can add vendors and connect MaxifyTickets later.</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
            </div>

            <label className="grid gap-1.5 text-sm font-medium text-slate-700">Event name
              <input required value={name} onChange={(e) => { setName(e.target.value); clearError(); }} placeholder="e.g. TechConnect Lagos 2026" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
<label className="grid gap-1.5 text-sm font-medium text-slate-700">Event type
                <input required value={eventType} onChange={(e) => { setEventType(e.target.value); clearError(); }} placeholder="e.g. Conference, Wedding" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">Event date
                <input required type="datetime-local" value={eventDate} onChange={(e) => { setEventDate(e.target.value); clearError(); }} className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">Number of guests
                <input required type="number" min="1" value={guestCount} onChange={(e) => { setGuestCount(e.target.value); clearError(); }} placeholder="e.g. 500" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">Location
                <input required value={location} onChange={(e) => { setLocation(e.target.value); clearError(); }} placeholder="City or venue address" className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" />
              </label>
            </div>

            {error ? <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={onClose} className="rounded-full px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300">
                {isSubmitting ? "Creating..." : "Create event"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}