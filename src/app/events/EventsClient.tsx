"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvents, type Event } from "@/lib/api";
import { Calendar, MapPin, Users, Plus } from "@/components/landing/icons";

export default function EventsClient() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEvents()
      .then((result) => {
        if (result.error) {
          setError(result.error);
        } else {
          setEvents(result.data || []);
        }
      })
      .catch(() => setError("Failed to load events"))
      .finally(() => setIsLoading(false));
  }, []);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getEvents();

      if (result.error) {
        setError(result.error);
      } else {
        setEvents(result.data || []);
      }
    } catch {
      setError("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DRAFT":
        return "bg-slate-100 text-slate-700";
      case "READY":
        return "bg-blue-100 text-blue-700";
      case "LAUNCHED":
        return "bg-emerald-100 text-emerald-700";
      case "COMPLETED":
        return "bg-purple-100 text-purple-700";
      case "CANCELLED":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
        <p className="text-rose-700">{error}</p>
        <button
          onClick={() => {
            void loadEvents();
          }}
          className="mt-4 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-12 text-center">
        <Calendar className="mx-auto h-16 w-16 text-slate-400" />
        <h3 className="mt-4 text-xl font-semibold text-slate-900">No events yet</h3>
        <p className="mt-2 text-slate-600">
          Create your first event to get started with Maxify Tickets integration.
        </p>
        <button
          onClick={() => router.push("/events/new")}
          className="mt-6 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 inline-block h-4 w-4" />
          Create Your First Event
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-slate-600">
          {events.length} {events.length === 1 ? "event" : "events"}
        </p>
        <button
          onClick={() => router.push("/events/new")}
          className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 inline-block h-4 w-4" />
          New Event
        </button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div
            key={event.id}
            onClick={() => router.push(`/events/${event.id}`)}
            className="cursor-pointer rounded-3xl border border-slate-200 bg-white p-6 transition hover:border-blue-300 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">
                  {event.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">{event.eventType}</p>
              </div>
              <span
                className={`ml-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                  event.status
                )}`}
              >
                {event.status}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="mr-2 h-4 w-4 text-slate-400" />
                {formatDate(event.eventDate)}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="mr-2 h-4 w-4 text-slate-400" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="mr-2 h-4 w-4 text-slate-400" />
                {event.guestCount} guests
              </div>
            </div>

            {event.readinessScore > 0 && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Readiness</span>
                  <span className="font-semibold text-slate-900">
                    {event.readinessScore}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{ width: `${event.readinessScore}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
