"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getAuthToken, getAuthUser, getCurrentUser, getEvents, saveAuthUser, type Event, type User } from "@/lib/api";
import { getEventTypeImage, FALLBACK_AVATAR_IMAGE } from "@/lib/images";
import { Calendar, Clock, MapPin, Plus, Users, DollarSign, Eye, Bell, Message } from "@/components/landing/icons";
import { PlannerShell, type PlannerSection } from "@/app/_planner/PlannerShell";
import { CreateEventModal } from "@/components/events/CreateEventModal";

type FilterKey = "all" | "draft" | "published" | "upcoming" | "ongoing" | "completed";

function formatDateShort(value: string | undefined | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatTime(value: string | undefined | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function getStatusColor(status: string) {
  const s = status?.toUpperCase?.() ?? "";
  switch (s) {
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
}

function statusLabel(status: string) {
  const s = status?.toUpperCase?.() ?? "";
  if (s === "READY" || s === "LAUNCHED" || s === "DRAFT") return s.charAt(0) + s.slice(1).toLowerCase();
  return s.charAt(0) + s.slice(1).toLowerCase();
}

function isUpcoming(event: Event) {
  if (!event.eventDate) return false;
  const d = new Date(event.eventDate);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d > now;
}

function isOngoing(event: Event) {
  const status = event.status?.toUpperCase?.() ?? "";
  if (status === "LAUNCHED") return true;
  if (!event.eventDate) return false;
  const d = new Date(event.eventDate);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d <= now && d.getTime() + 24 * 60 * 60 * 1000 >= now.getTime();
}

export default function MyEventsClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeSection, setActiveSection] = useState<PlannerSection>("My Events");
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadEvents() {
      setIsLoading(true);
      setError(null);

      const storedUser = getAuthUser();
      if (!storedUser && !getAuthToken()) {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
          router.replace("/signin");
        }
        return;
      }

      if (!cancelled) {
        setUser(storedUser ?? null);
      }

      const result = await getEvents(getAuthToken() ?? undefined);

      if (result.error) {
        const message = String(result.error ?? "");
        const isPermissionError = /permission/i.test(message) || message.includes("403");

        if (isPermissionError) {
          const me = await getCurrentUser();
          if (me.data) {
            const refreshedUser = me.data as User;
            const mergedUser = { ...(getAuthUser() ?? {} as User), ...refreshedUser };
            saveAuthUser(mergedUser);
            if (!cancelled) setUser(mergedUser);

            const retry = await getEvents(getAuthToken() ?? undefined);
            if (!cancelled) {
              if (!retry.error && retry.data) {
                setEvents(retry.data);
              } else {
                setError(retry.error ?? result.error);
              }
              setIsLoading(false);
            }
            return;
          }
        }

        if (!cancelled) {
          setError(result.error);
        }
      } else if (result.data) {
        if (!cancelled) {
          setEvents(result.data);
        }
      }

      if (!cancelled) {
        setIsLoading(false);
      }
    }

    void loadEvents();
    return () => {
      cancelled = true;
    };
  }, [router, reloadKey]);

  const filtered = useMemo(() => {
    switch (filter) {
      case "draft":
        return events.filter((e) => (e.status?.toUpperCase() ?? "") === "DRAFT");
      case "published":
        return events.filter((e) =>
          ["READY", "LAUNCHED", "COMPLETED"].includes(e.status?.toUpperCase() ?? ""),
        );
      case "upcoming":
        return events.filter((e) => isUpcoming(e) && (e.status?.toUpperCase() ?? "") !== "COMPLETED");
      case "ongoing":
        return events.filter((e) => isOngoing(e));
      case "completed":
        return events.filter((e) => (e.status?.toUpperCase() ?? "") === "COMPLETED");
      default:
        return events;
    }
  }, [events, filter]);

  if (!user) {
    return null;
  }

  const userRole = (user.role || "").toUpperCase();
  if (userRole !== "PLANNER" && userRole !== "ADMIN") {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-sm text-amber-700">
          Only planners and admins can access this page.
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

  return (
      <PlannerShell
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      >
      <PlannerShellTopBar
        user={user}
        unreadMessageCount={0}
      />

      <header className="mb-2">
        <h1 className="text-3xl font-semibold text-slate-950">My Events</h1>
        <p className="mt-1 text-slate-500">Manage and monitor all your events</p>
      </header>

      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <SortButton />
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-[28px] bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>
      </div>

      <FilterBar filter={filter} setFilter={setFilter} />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-24 flex-shrink-0 animate-pulse rounded-[20px] bg-slate-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                  <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Calendar className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-950">No events yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            Create your first event and start managing everything from one place.
          </p>
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-[28px] bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Event
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} onView={() => router.push(`/events/${event.id}`)} onEdit={() => router.push(`/events/${event.id}`)} />
          ))}
        </div>
      )}

      {createModalOpen ? (
        <CreateEventModal
          onClose={() => setCreateModalOpen(false)}
          onCreated={() => setReloadKey((k) => k + 1)}
        />
      ) : null}
    </PlannerShell>
  );
}

function SortButton() {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-[28px] border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
    >
      Sort: Newest
    </button>
  );
}

function FilterBar({
  filter,
  setFilter,
}: {
  filter: FilterKey;
  setFilter: (f: FilterKey) => void;
}) {
  const filters = [
    { key: "all" as FilterKey, label: "All" },
    { key: "draft" as FilterKey, label: "Draft" },
    { key: "published" as FilterKey, label: "Published" },
    { key: "upcoming" as FilterKey, label: "Upcoming" },
    { key: "ongoing" as FilterKey, label: "Ongoing" },
    { key: "completed" as FilterKey, label: "Completed" },
  ];

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filters.map((f) => {
        const isActive = filter === f.key;
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-blue-600 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}

function EventCard({ event, onView, onEdit }: { event: Event; onView: () => void; onEdit: () => void }) {
  const coverImage = getEventTypeImage(event.eventType, parseInt(event.id.slice(-6), 10) || 0);
  const tickets = event.tickets ?? [];
  const sold = tickets.filter((t) => ["ACTIVE", "USED"].includes(t.status)).length;
  const revenue = event.analytics?.totalTickets ?? 0;
  const attendeesCount = tickets.filter((t) => t.status === "USED").length;

  return (
    <div className="group rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <div className="relative h-36 w-full flex-shrink-0 overflow-hidden rounded-t-[28px] sm:rounded-l-[28px] sm:rounded-t-none">
          <Image src={coverImage} alt={event.name} fill className="object-cover" sizes="200px" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
          <span
            className={`absolute left-3 top-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(event.status ?? "")}`}
          >
            {statusLabel(event.status ?? "")}
          </span>
        </div>

        <div className="flex-1 p-5">
          <h3 className="text-xl font-semibold text-slate-950">{event.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{event.eventType}</p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span>{formatDateShort(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span>{formatTime(event.eventDate)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="truncate">{event.location || "Venue not set"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              <span>{event.guestCount ?? 0} guests</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tickets Sold</p>
              <p className="mt-1 font-semibold text-slate-950">{sold}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Attendees</p>
              <p className="mt-1 font-semibold text-slate-950">{attendeesCount}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Revenue</p>
              <p className="mt-1 font-semibold text-slate-950 flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-slate-400" />
                <span>{revenue}</span>
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Status</p>
              <span
                className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(event.status ?? "")}`}
              >
                {statusLabel(event.status ?? "")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-l border-slate-200 p-3 sm:border-l sm:border-t-0 sm:border-l-0 sm:pl-3">
          <button
            type="button"
            onClick={onView}
            className="rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
            aria-label="View event"
            title="View event"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
            aria-label="Edit event"
            title="Edit event"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="M17 3a2.85 2.85 0 1 1 4 4L10 22l-4 1 1-4 11-11a2.85 2.85 0 0 1 4 0z" />
            </svg>
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
            aria-label="More actions"
            title="More actions"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <circle cx="12" cy="12" r="1" />
              <circle cx="19" cy="12" r="1" />
              <circle cx="12" cy="19" r="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function PlannerShellTopBar({
  user,
  unreadMessageCount = 0,
}: {
  user: User | null;
  unreadMessageCount?: number;
}) {
  const router = useRouter();
  return (
    <div className="rounded-[32px] bg-white p-4 shadow-sm mb-6">
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push("/dashboard#messages")}
          className="rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
          aria-label="Messages"
        >
          <Message className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="relative rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadMessageCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
              {unreadMessageCount > 99 ? "99+" : unreadMessageCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => router.push("/dashboard#profile")}
          className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 pl-1 pr-3 py-1 transition hover:bg-slate-100"
          aria-label="Profile"
        >
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt={user.firstName ?? "Profile"}
              width={36}
              height={36}
              className="h-9 w-9 rounded-full object-cover"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = FALLBACK_AVATAR_IMAGE;
              }}
            />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
              {(() => {
                const u = user ?? { firstName: "", lastName: "" };
                const initials = [u.firstName, u.lastName]
                  .filter(Boolean)
                  .map((name) => name?.[0].toUpperCase())
                  .join("");
                return initials || "U";
              })()}
            </div>
          )}
          <span className="hidden sm:block text-sm font-semibold text-slate-700">
            {user?.firstName} {user?.lastName}
          </span>
        </button>
      </div>
    </div>
  );
}
