"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent, getAuthUser, getCurrentUser, saveAuthUser, clearAuth, getAuthToken, type User } from "@/lib/api";

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [user, setUser] = useState<User | null>(() => getAuthUser());

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-700">
          You need to sign in to create an event.
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="mt-4 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  if ((user.role || "").toUpperCase() !== "PLANNER" && (user.role || "").toUpperCase() !== "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700">
          Only planners and admins can create events.
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="mt-4 rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const token = getAuthToken();
      const result = await createEvent({
        name,
        eventType,
        eventDate: new Date(eventDate).toISOString(),
        location,
        guestCount: parseInt(guestCount, 10),
      }, token ?? undefined);

      if (result.error) {
        const message = String(result.error ?? "");
        const isPermissionError = /permission/i.test(message) || message.includes("403");
        if (isPermissionError) {
          const me = await getCurrentUser();
          if (me.data) {
            const mergedUser = { ...(getAuthUser() ?? {} as User), ...me.data };
            saveAuthUser(mergedUser);
            setUser(mergedUser);
             if ((mergedUser.role ?? "").toUpperCase() !== "PLANNER" && (mergedUser.role ?? "").toUpperCase() !== "ADMIN") {
              router.replace("/dashboard");
              return;
            }
            const retry = await createEvent({
              name,
              eventType,
              eventDate: new Date(eventDate).toISOString(),
              location,
              guestCount: parseInt(guestCount, 10),
            }, getAuthToken() ?? undefined);
            if (retry.error) {
              setError(retry.error);
            } else if (retry.data) {
              router.push(`/events/${retry.data.id}`);
            }
          } else {
            clearAuth();
            router.replace("/signin");
          }
        } else {
          setError(result.error);
        }
        setIsSubmitting(false);
      } else if (result.data) {
        router.push(`/events/${result.data.id}`);
      }
    } catch {
      setError("Failed to create event");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-slate-900">Create New Event</h1>
      <p className="mt-2 text-slate-600">
        Set up your event details. Add vendors and launch with Maxify later.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Event Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="e.g. TechConnect Lagos 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Event Type *</label>
          <input
            type="text"
            required
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="e.g. Conference, Wedding"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700">Event Date *</label>
            <input
              type="datetime-local"
              required
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Guest Count *</label>
            <input
              type="number"
              required
              min="1"
              value={guestCount}
              onChange={(e) => setGuestCount(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
              placeholder="e.g. 500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Location *</label>
          <input
            type="text"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="e.g. Lagos, Nigeria"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-full px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:bg-slate-300"
          >
            {isSubmitting ? "Creating..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}

