"use client";

import { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  getAuthUser,
  getCurrentUser,
  saveAuthUser,
  clearAuth,
  getAuthToken,
  getEvent,
  getMaxifyIntegrationInfo,
  getTicketStats,
  getAttendanceData,
  getEventAnalytics,
  getGuestStats,
  getEventReadiness,
  getEventTickets,
  launchEvent,
  syncMaxifyEvent,
  connectMaxifyEvent,
  type User,
  type Event,
  type MaxifyIntegrationInfo,
  type TicketStats,
  type AttendanceData,
  type EventAnalytics,
  type GuestStats,
  type EventReadiness,
  type Ticket as TicketRecord,
} from "@/lib/api";
import { getEventTypeImage } from "@/lib/images";
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Info,
  Ticket,
  Check,
  Settings,
  ShieldCheck,
  Clock,
  AlertTriangle,
  BarChart3,
  UserPlus,
  ExternalLink,
  RefreshCw,
  Play,
  Square,
  DollarSign,
  Eye,
  TrendingUp,
  XCircle,
  Loader2,
} from "@/components/landing/icons";

type EventTab = "overview" | "tickets" | "attendees" | "orders" | "analytics" | "team" | "settings";

function getStatusColor(status: string) {
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
}

function formatCurrency(value: number | undefined | null) {
  if (typeof value !== "number") return "₦0";
  return `₦${value.toLocaleString()}`;
}

function formatDateTime(value: string | undefined | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function formatDateShort(value: string | undefined | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(value: string | undefined | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EventWorkspaceClient({ eventId }: { eventId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getAuthUser>>(getAuthUser);

  useEffect(() => {
    if (!user) {
      router.replace("/signin");
      return;
    }
    if (user.role.toUpperCase() !== "PLANNER" && user.role.toUpperCase() !== "ADMIN") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  const [event, setEvent] = useState<Event | null>(null);
  const [integrationInfo, setIntegrationInfo] = useState<MaxifyIntegrationInfo | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [readiness, setReadiness] = useState<EventReadiness | null>(null);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [activeTab, setActiveTab] = useState<EventTab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const loadEventData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError(null);

    async function doLoad() {
      const [
        eventResult,
        integrationResult,
        statsResult,
        attendanceResult,
        analyticsResult,
        guestResult,
        readinessResult,
        ticketsResult,
      ] = await Promise.all([
        getEvent(eventId),
        getMaxifyIntegrationInfo(eventId),
        getTicketStats(eventId),
        getAttendanceData(eventId),
        getEventAnalytics(eventId),
        getGuestStats(eventId),
        getEventReadiness(eventId),
        getEventTickets(eventId),
      ]);

      if (eventResult.error && !eventResult.data) {
        const isPermissionError = eventResult.statusCode === 403;
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
            const token = getAuthToken();
            const retryEvent = await getEvent(eventId, token ?? undefined);
            if (retryEvent.error) {
              setError(retryEvent.error);
            } else {
              setEvent(retryEvent.data);
              setIntegrationInfo(integrationResult.data ?? null);
              setTicketStats(statsResult.data ?? null);
              setAttendanceData(attendanceResult.data ?? null);
              setEventAnalytics(analyticsResult.data ?? null);
              setGuestStats(guestResult.data ?? null);
              setReadiness(readinessResult.data ?? null);
              setTickets(ticketsResult.data ?? []);
            }
          } else {
            clearAuth();
            router.replace("/signin");
          }
          return;
        }
      }
      setError(eventResult.error);
      setIntegrationInfo(integrationResult.data ?? null);
      setTicketStats(statsResult.data ?? null);
      setAttendanceData(attendanceResult.data ?? null);
      setEventAnalytics(analyticsResult.data ?? null);
      setGuestStats(guestResult.data ?? null);
      setReadiness(readinessResult.data ?? null);
      setTickets(ticketsResult.data ?? []);
    }

    try {
      await doLoad();
    } catch {
      setError("Failed to load event data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [eventId, router]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let cancelled = false;
    loadEventData();
    return () => {
      cancelled = true;
    };
  }, [loadEventData]);
  /* eslint-enable react-hooks/set-state-in-effect */
  // eslint-enable react-hooks/set-state-in-effect

  const handlePublishToggle = async () => {
    if (!event) return;
    setIsPublishing(true);
    setActionError(null);
    const result = await launchEvent(event.id);
    if (result.error) {
      setActionError(result.error);
    } else if (result.data) {
      setEvent(result.data);
    }
    setIsPublishing(false);
  };

  const handleSyncMaxify = async () => {
    setIsSyncing(true);
    setActionError(null);
    const result = await syncMaxifyEvent(eventId);
    if (result.error) {
      setActionError(result.error);
    } else if (result.data) {
      setEvent(result.data);
      void loadEventData();
    }
    setIsSyncing(false);
  };

  const handleConnectMaxify = async () => {
    setIsConnecting(true);
    setActionError(null);
    const result = await connectMaxifyEvent(eventId);
    if (result.error) {
      setActionError(result.error);
    } else if (result.data) {
      setEvent(result.data);
      void loadEventData();
    }
    setIsConnecting(false);
  };

  const isMaxifyConnected = integrationInfo?.isProduction || integrationInfo?.mode === "connected";
  const coverImage = event ? getEventTypeImage(event.eventType, parseInt(event.id.slice(-6), 10) || 0) : null;

  const actionItems = [
    {
      id: "venue",
      label: event?.location ? "Venue configured" : "Add event venue",
      description: event?.location ? "Venue is set" : "Set a venue for your event",
      status: event?.location ? "completed" : "critical",
      cta: event?.location ? undefined : "Add Venue",
      href: event?.location ? undefined : `/events/${eventId}/edit`,
    },
    {
      id: "maxify",
      label: "MaxifyTickets",
      description: isMaxifyConnected ? "Ticketing is connected" : "Connect ticketing to sell tickets",
      status: isMaxifyConnected ? "completed" : "critical",
      cta: isMaxifyConnected ? undefined : "Connect",
      href: isMaxifyConnected ? undefined : undefined,
      action: isMaxifyConnected ? undefined : handleConnectMaxify,
    },
    {
      id: "tickets",
      label: "Ticket types",
      description: ticketStats && ticketStats.ticketTypes.length > 0 ? `${ticketStats.ticketTypes.length} ticket type(s) created` : "Add ticket types for your event",
      status: ticketStats && ticketStats.ticketTypes.length > 0 ? "completed" : "needs-attention",
      cta: ticketStats && ticketStats.ticketTypes.length > 0 ? undefined : "Create Tickets",
      href: ticketStats && ticketStats.ticketTypes.length > 0 ? undefined : `/events/${eventId}/tickets`,
    },
    {
      id: "publish",
      label: event?.status === "DRAFT" ? "Publish event" : "Event published",
      description: event?.status === "DRAFT" ? "Your event is still a draft" : "Event is live or completed",
      status: event?.status === "DRAFT" ? "needs-attention" : "completed",
      cta: event?.status === "DRAFT" ? "Publish Event" : undefined,
      action: event?.status === "DRAFT" ? handlePublishToggle : undefined,
    },
  ];

  const recentOrders = tickets
    .filter((t) => t.status === "ACTIVE" || t.status === "USED")
    .slice(0, 5);

  const ticketTypeStats = ticketStats?.ticketTypes ?? [];

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

  if (error || !event) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-12 text-center">
        <p className="text-rose-700">{error || "Event not found"}</p>
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
    <div className="mx-auto max-w-7xl space-y-6">
      <button
        type="button"
        onClick={() => router.push("/events")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </button>

      {actionError && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">
          {actionError}
        </div>
      )}

      {/* ==================== EVENT HEADER ==================== */}
      <div className="rounded-[32px] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl sm:h-20 sm:w-20">
              {coverImage ? (
                <Image src={coverImage} alt={event.name} fill className="object-cover" sizes="80px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-100">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">{event.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                  {event.status}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateShort(event.eventDate)}
                </span>
                <span className="hidden sm:inline">·</span>
                <span className="hidden items-center gap-1 sm:inline-flex">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(event.eventDate)}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {event.location}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {event.status === "DRAFT" && (
              <button
                type="button"
                onClick={handlePublishToggle}
                disabled={isPublishing}
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                {isPublishing ? "Publishing..." : "Publish Event"}
              </button>
            )}
            {event.status !== "DRAFT" && (
              <button
                type="button"
                onClick={handlePublishToggle}
                disabled={isPublishing}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
              >
                {isPublishing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {isPublishing ? "Updating..." : "Unpublish"}
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>
            {event.maxifyEventUrl && (
              <a
                href={event.maxifyEventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </a>
            )}
            <button
              type="button"
              onClick={() => router.push("/events")}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span>Event ID: {event.id}</span>
          {event.readinessScore > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Readiness: {event.readinessScore}%
              </span>
            </>
          )}
          {integrationInfo?.isDemo && (
            <>
              <span>·</span>
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Partner Demo Environment
              </span>
            </>
          )}
        </div>
      </div>

      {/* ==================== KPI CARDS ==================== */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tickets Sold</p>
            <Ticket className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {isLoading ? "..." : ticketStats?.totalSold ?? "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {ticketStats && ticketStats.totalCapacity > 0
              ? `${Math.round((ticketStats.totalSold / ticketStats.totalCapacity) * 100)}% of capacity`
              : "No capacity data"}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Revenue</p>
            <DollarSign className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {isLoading ? "..." : formatCurrency(ticketStats?.totalRevenue)}
          </p>
          <p className="mt-2 text-xs text-slate-500">Total ticket revenue</p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Attendees</p>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {isLoading ? "..." : guestStats?.registered ?? attendanceData?.summary.registered ?? "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {attendanceData ? `${attendanceData.summary.checkedIn} checked in` : "No check-in data"}
          </p>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Event Views</p>
            <Eye className="h-5 w-5 text-slate-400" />
          </div>
          <p className="mt-4 text-3xl font-semibold text-slate-950">
            {isLoading ? "..." : eventAnalytics ? `${eventAnalytics.totalTickets}+` : "—"}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            {eventAnalytics ? `${eventAnalytics.attendanceRate}% attendance rate` : "No analytics yet"}
          </p>
        </div>
      </div>

      {/* ==================== EVENT NAVIGATION ==================== */}
      <div className="rounded-[32px] bg-white p-2 shadow-sm">
        <nav className="flex gap-1 overflow-x-auto">
          {([
            { id: "overview", label: "Overview", icon: <Info className="h-4 w-4" /> },
            { id: "tickets", label: "Tickets", icon: <Ticket className="h-4 w-4" /> },
            { id: "attendees", label: "Attendees", icon: <Users className="h-4 w-4" /> },
            { id: "orders", label: "Orders", icon: <BarChart3 className="h-4 w-4" /> },
            { id: "analytics", label: "Analytics", icon: <TrendingUp className="h-4 w-4" /> },
            { id: "team", label: "Team", icon: <UserPlus className="h-4 w-4" /> },
            { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold whitespace-nowrap transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ==================== TAB CONTENT ==================== */}
      <div className="space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left: Event Information */}
            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Event Information</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Overview</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/events/${eventId}/edit`)}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Edit Event
                  </button>
                </div>

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: "Event Type", value: event.eventType },
                    { label: "Status", value: event.status },
                    { label: "Date", value: formatDateShort(event.eventDate) },
                    { label: "Time", value: formatTime(event.eventDate) },
                    { label: "Venue", value: event.location },
                    { label: "Expected Guests", value: event.guestCount.toString() },
                    { label: "Organizer", value: event.planner ? `${event.planner.firstName} ${event.planner.lastName}` : "—" },
                    { label: "Event ID", value: event.id },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                    </div>
                  ))}
                </div>

                {event.description && (
                  <div className="mt-6">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Description</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">{event.description}</p>
                  </div>
                )}
              </div>

              {/* MaxifyTickets Section */}
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Ticketing</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">MaxifyTickets</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMaxifyConnected ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Connected
                      </span>
                    ) : integrationInfo ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Not Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Unknown
                      </span>
                    )}
                    {isMaxifyConnected && (
                      <button
                        type="button"
                        onClick={handleSyncMaxify}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
                      >
                        {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                        {isSyncing ? "Syncing..." : "Sync"}
                      </button>
                    )}
                  </div>
                </div>

                {integrationInfo?.isDemo && (
                  <div className="mt-4 flex items-start rounded-2xl border border-blue-200 bg-blue-50 p-4">
                    <Info className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                    <p className="text-sm text-blue-800">{integrationInfo.description}</p>
                  </div>
                )}

                {isMaxifyConnected ? (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tickets Sold</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{ticketStats?.totalSold ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Remaining</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">
                        {(ticketStats?.totalCapacity ?? 0) - (ticketStats?.totalSold ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Revenue</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{formatCurrency(ticketStats?.totalRevenue)}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ticket Types</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{ticketStats?.ticketTypes.length ?? 0}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center">
                    <p className="text-sm text-slate-600">MaxifyTickets is not connected for this event.</p>
                    <button
                      type="button"
                      onClick={handleConnectMaxify}
                      disabled={isConnecting}
                      className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isConnecting ? "Connecting..." : "Connect MaxifyTickets"}
                    </button>
                  </div>
                )}

                {event.maxifyEventUrl && (
                  <div className="mt-4">
                    <a
                      href={event.maxifyEventUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Open Maxify Event <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Action Required */}
            <div className="space-y-6">
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Action Required</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Checklist</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {actionItems.map((item) => {
                    const statusStyles = {
                      completed: "bg-emerald-50 border-emerald-200",
                      "needs-attention": "bg-amber-50 border-amber-200",
                      critical: "bg-rose-50 border-rose-200",
                    };
                    const iconStyles = {
                      completed: <Check className="h-5 w-5 text-emerald-600" />,
                      "needs-attention": <AlertTriangle className="h-5 w-5 text-amber-600" />,
                      critical: <XCircle className="h-5 w-5 text-rose-600" />,
                    };

                    return (
                      <div key={item.id} className={`rounded-2xl border p-4 ${statusStyles[item.status as keyof typeof statusStyles] || statusStyles.critical}`}>
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{iconStyles[item.status as keyof typeof iconStyles] || iconStyles.critical}</div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                            <p className="mt-1 text-xs text-slate-600">{item.description}</p>
                            {item.cta && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.action) {
                                    item.action();
                                  } else if (item.href) {
                                    router.push(item.href);
                                  }
                                }}
                                className="mt-3 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
                              >
                                {item.cta}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Event Health */}
              {readiness && (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Event Health</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Readiness</h2>
                    </div>
                    <span className="text-2xl font-bold text-slate-950">{readiness.score}%</span>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${readiness.score}%` }}
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    {readiness.checks.map((check) => (
                      <div key={check.name} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600">
                          {check.passed ? (
                            <Check className="h-4 w-4 text-emerald-600" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                          )}
                          {check.name}
                        </span>
                        <span className="text-xs text-slate-500">{check.points} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TICKETS TAB */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Ticketing</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Ticket Performance</h2>
                </div>
                {isMaxifyConnected && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push("/dashboard")}
                      className="text-sm font-semibold text-blue-600 hover:underline"
                    >
                      Manage in Dashboard
                    </button>
                  </div>
                )}
              </div>

              {!isMaxifyConnected ? (
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-600">Connect MaxifyTickets to view ticket performance.</p>
                  <button
                    type="button"
                    onClick={handleConnectMaxify}
                    disabled={isConnecting}
                    className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isConnecting ? "Connecting..." : "Connect MaxifyTickets"}
                  </button>
                </div>
              ) : ticketTypeStats.length === 0 ? (
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-600">No ticket types created yet.</p>
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Create Ticket Type
                  </button>
                </div>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.24em] text-slate-500">
                        <th className="pb-3 font-medium">Ticket Type</th>
                        <th className="pb-3 font-medium">Price</th>
                        <th className="pb-3 font-medium">Total</th>
                        <th className="pb-3 font-medium">Sold</th>
                        <th className="pb-3 font-medium">Remaining</th>
                        <th className="pb-3 font-medium">Revenue</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ticketTypeStats.map((type) => (
                        <tr key={type.id} className="hover:bg-slate-50">
                          <td className="py-4 font-semibold text-slate-900">{type.name}</td>
                          <td className="py-4 text-slate-600">{formatCurrency(type.price)}</td>
                          <td className="py-4 text-slate-600">{type.maxCapacity}</td>
                          <td className="py-4 text-slate-600">{type.totalSold}</td>
                          <td className="py-4 text-slate-600">{type.maxCapacity - type.totalSold}</td>
                          <td className="py-4 text-slate-600">{formatCurrency(type.revenue)}</td>
                          <td className="py-4 text-right">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${type.percentageSold >= 100 ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                              {type.percentageSold}% sold
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ATTENDEES TAB */}
        {activeTab === "attendees" && (
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Attendees</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Attendee Summary</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="text-sm font-semibold text-blue-600 hover:underline"
                  >
                    Manage Attendees
                  </button>
                </div>
              </div>

              {!isMaxifyConnected ? (
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-600">Connect MaxifyTickets to view attendees.</p>
                  <button
                    type="button"
                    onClick={handleConnectMaxify}
                    disabled={isConnecting}
                    className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {isConnecting ? "Connecting..." : "Connect MaxifyTickets"}
                  </button>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Attendees</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {isLoading ? "..." : attendanceData?.summary.registered ?? guestStats?.registered ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Checked In</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {isLoading ? "..." : attendanceData?.summary.checkedIn ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Not Checked In</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {isLoading ? "..." : attendanceData?.summary.notCheckedIn ?? 0}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Attendance Rate</p>
                    <p className="mt-3 text-2xl font-semibold text-slate-950">
                      {isLoading ? "..." : `${attendanceData?.summary.attendanceRate ?? 0}%`}
                    </p>
                  </div>
                </div>
              )}

              {attendanceData && attendanceData.recentCheckIns.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-500">Recent Check-ins</p>
                  <div className="mt-4 space-y-3">
                    {attendanceData.recentCheckIns.slice(0, 10).map((checkIn) => (
                      <div key={checkIn.id} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{checkIn.name}</p>
                            <p className="text-xs text-slate-500">
                              {checkIn.ticketType} · {formatDateTime(checkIn.checkedInAt)}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Checked In</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Orders</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recent Orders</h2>
              </div>
            </div>

            {!isMaxifyConnected ? (
              <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">Connect MaxifyTickets to view orders.</p>
                <button
                  type="button"
                  onClick={handleConnectMaxify}
                  disabled={isConnecting}
                  className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isConnecting ? "Connecting..." : "Connect MaxifyTickets"}
                </button>
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-sm text-slate-600">No ticket orders yet.</p>
                <p className="mt-1 text-xs text-slate-500">Purchases will appear here when tickets are sold.</p>
              </div>
            ) : (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.24em] text-slate-500">
                      <th className="pb-3 font-medium">Order ID</th>
                      <th className="pb-3 font-medium">Customer</th>
                      <th className="pb-3 font-medium">Ticket</th>
                      <th className="pb-3 font-medium">Amount</th>
                      <th className="pb-3 font-medium">Status</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="py-4 font-mono text-xs text-slate-600">{order.id.slice(0, 8)}...</td>
                        <td className="py-4">
                          <div>
                            <p className="font-semibold text-slate-900">{order.purchaserName}</p>
                            <p className="text-xs text-slate-500">{order.purchaserEmail}</p>
                          </div>
                        </td>
                        <td className="py-4 text-slate-600">{order.ticketType}</td>
                        <td className="py-4 text-slate-600">{formatCurrency(ticketStats?.totalRevenue)}</td>
                        <td className="py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${order.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : order.status === "USED" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">{formatDateShort(order.purchaseDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Performance</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Event Analytics Preview</h2>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="text-sm font-semibold text-blue-600 hover:underline"
                >
                  View Full Analytics
                </button>
              </div>

              {!eventAnalytics ? (
                <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                  <p className="text-sm text-slate-600">No analytics data available yet.</p>
                  <p className="mt-1 text-xs text-slate-500">Analytics will appear here after your event launches.</p>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Total Tickets", value: eventAnalytics.totalTickets },
                    { label: "Total Check-ins", value: eventAnalytics.totalCheckedIn },
                    { label: "Attendance Rate", value: `${eventAnalytics.attendanceRate}%` },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
                      <p className="mt-3 text-2xl font-semibold text-slate-950">{metric.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEAM TAB */}
        {activeTab === "team" && (
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">People</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Event Team</h2>
              </div>
              <button
                type="button"
                onClick={() => router.push("/dashboard")}
                className="text-sm font-semibold text-blue-600 hover:underline"
              >
                Manage Team
              </button>
            </div>

            <div className="mt-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                    {event.planner ? `${event.planner.firstName[0]}${event.planner.lastName[0]}` : "EC"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {event.planner ? `${event.planner.firstName} ${event.planner.lastName}` : "Event Organizer"}
                    </p>
                    <p className="text-xs text-slate-500">{event.planner?.email || "Organizer"}</p>
                  </div>
                </div>
              </div>
              {event.eventVendors && event.eventVendors.length > 0 && (
                <div className="mt-4 space-y-3">
                  {event.eventVendors.map((vendor) => (
                    <div key={vendor.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                          {vendor.vendor ? `${vendor.vendor.firstName[0]}${vendor.vendor.lastName[0]}` : "V"}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {vendor.vendor ? `${vendor.vendor.firstName} ${vendor.vendor.lastName}` : "Vendor"}
                          </p>
                          <p className="text-xs text-slate-500">{vendor.role || vendor.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Configuration</p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-950">Event Settings</h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Event Name", value: event.name },
                { label: "Event Type", value: event.eventType },
                { label: "Status", value: event.status },
                { label: "Location", value: event.location },
                { label: "Expected Guests", value: event.guestCount.toString() },
                { label: "Maxify Event ID", value: event.maxifyEventId || "Not connected" },
                { label: "Maxify Mode", value: event.maxifyMode || "—" },
                { label: "Last Synced", value: event.maxifySyncedAt ? formatDateTime(event.maxifySyncedAt) : "Never" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => router.push(`/events/${eventId}/edit`)}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Edit Event
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
