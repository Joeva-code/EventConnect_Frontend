"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getEvent, getMaxifyIntegrationInfo, type Event, type MaxifyIntegrationInfo } from "@/lib/api";
import { Calendar, MapPin, Users, ArrowLeft, Info } from "@/components/landing/icons";

export default function EventWorkspaceClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [integrationInfo, setIntegrationInfo] = useState<MaxifyIntegrationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getEvent(eventId), getMaxifyIntegrationInfo(eventId)])
      .then(([eventResult, integrationResult]) => {
        if (cancelled) return;
        if (eventResult.data) setEvent(eventResult.data);
        if (integrationResult.data) setIntegrationInfo(integrationResult.data);
      })
      .catch((err: unknown) => {
        if (!cancelled) console.error("Failed to load event:", err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-12 text-center">
        <p className="text-rose-700">Event not found</p>
        <button
          onClick={() => router.push("/events")}
          className="mt-4 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-700"
        >
          Back to Events
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8">
        <button
          onClick={() => router.push("/events")}
          className="mb-4 flex items-center text-sm text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{event.name}</h1>
            <p className="mt-1 text-slate-600">{event.eventType}</p>
          </div>
          <div className="flex items-center gap-2">
            {integrationInfo?.isDemo && (
              <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                Partner Demo Environment
              </span>
            )}
          </div>
        </div>

        {integrationInfo?.isDemo && (
          <div className="mt-4 flex items-start rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <Info className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <p className="text-sm text-blue-800">
              {integrationInfo.description}
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Event Details</h3>
            <div className="mt-4 space-y-3">
              <div className="flex items-center text-sm text-slate-600">
                <Calendar className="mr-3 h-5 w-5 text-slate-400" />
                {new Date(event.eventDate).toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <MapPin className="mr-3 h-5 w-5 text-slate-400" />
                {event.location}
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Users className="mr-3 h-5 w-5 text-slate-400" />
                {event.guestCount} expected guests
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-slate-900">Maxify Tickets</h3>
            <p className="mt-2 text-sm text-slate-600">{integrationInfo?.providerName}</p>
            {event.maxifyEventUrl && (
              <a href={event.maxifyEventUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block text-sm text-blue-600 hover:text-blue-700">
                Open Maxify Event →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
