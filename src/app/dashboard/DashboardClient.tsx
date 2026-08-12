"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getAuthToken, getAuthUser, getEnquiries, getEvents, getMyAvailability, getMyVendorProfile, getVendors, saveAuthUser, type Enquiry, type Event, type User, updateEnquiryStatus, updateMyAvailability, updateMyVendorProfile, updateProfile, uploadProfileImage, createPortfolioItem, deletePortfolioItem, getMaxifyIntegrationInfo, getTicketStats, getAttendanceData, getEventAnalytics, getGuestStats, syncMaxifyEvent, connectMaxifyEvent, type TicketStats, type AttendanceData, type EventAnalytics, type GuestStats, type MaxifyIntegrationInfo } from "@/lib/api";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { BookingModal } from "@/components/vendors/BookingModal";
import { VendorDirectory } from "@/components/vendors/VendorDirectory";
import type { Vendor as DirectoryVendor } from "@/data/vendors";
import { Search, Bell, Calendar, Ticket, Message, Check, Info, LayoutDashboard, User as UserIcon, Settings, Plus, Users, LogOut } from "@/components/landing/icons";
import Image from "next/image";
import { EnquiryChat } from "@/components/enquiries/EnquiryChat";
import { FALLBACK_AVATAR_IMAGE } from "@/lib/images";
import { Logo } from "@/components/branding/Logo";

type PlannerSection =
  | "Dashboard"
  | "My Events"
  | "MaxifyTickets"
  | "Discover Vendors"
  | "Messages"
  | "Profile"
  | "Settings";

type PlannerNavItem = { id: PlannerSection; label: string; icon?: React.ReactNode; image?: React.ReactNode };

const plannerNavItems: PlannerNavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "My Events", label: "My Events", icon: <Calendar className="h-4 w-4" /> },
  { id: "MaxifyTickets", label: "MaxifyTickets", image: (
    <Image
      src="/image.png"
      alt="Maxify Tickets"
      width={120}
      height={36}
      className="h-9 w-auto object-contain"
    />
  ) },
  { id: "Discover Vendors", label: "Find Vendors", icon: <Search className="h-4 w-4" /> },
  { id: "Messages", label: "Messages", icon: <Message className="h-4 w-4" /> },
  { id: "Profile", label: "Profile", icon: <UserIcon className="h-4 w-4" /> },
  { id: "Settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

type VendorSection =
  | "Dashboard"
  | "Notifications"
  | "Bookings"
  | "Messages"
  | "Availability"
  | "Profile"
  | "Portfolio";

const vendorNavItems: VendorSection[] = [
  "Dashboard",
  "Notifications",
  "Bookings",
  "Messages",
  "Availability",
  "Profile",
  "Portfolio",
];

function enquiryList(value: unknown): Enquiry[] {
  if (Array.isArray(value)) return value as Enquiry[];
  if (!value || typeof value !== "object") return [];

  const response = value as Record<string, unknown>;
  for (const key of ["bookings", "enquiries", "data", "items", "results"]) {
    const list = enquiryList(response[key]);
    if (list.length > 0 || Array.isArray(response[key])) return list;
  }

  return [];
}

function contactName(enquiry: Enquiry, role: "PLANNER" | "VENDOR") {
  const contact = role === "VENDOR" ? enquiry.planner : enquiry.vendor;
  return contact?.name || [contact?.firstName, contact?.lastName].filter(Boolean).join(" ") || contact?.email || "EventConnect user";
}

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

export default function DashboardClient() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof getAuthUser>>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeVendorSection, setActiveVendorSection] = useState<VendorSection>("Dashboard");
  const [activeSection, setActiveSection] = useState<PlannerSection>("Dashboard");
  const [bookingVendor, setBookingVendor] = useState<DirectoryVendor | null>(null);
  const [bookingNotice, setBookingNotice] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [vendorList, setVendorList] = useState<DirectoryVendor[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [availabilityDate, setAvailabilityDate] = useState("");
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [chatEnquiry, setChatEnquiry] = useState<Enquiry | null>(null);
  const [readChatIds, setReadChatIds] = useState<Set<string>>(new Set());
  const [maxifySubPage, setMaxifySubPage] = useState<string>("Overview");

  function openChat(enquiry: Enquiry) {
    setReadChatIds((current) => {
      const next = new Set(current);
      next.add(enquiry.id);
      return next;
    });
    setChatEnquiry(enquiry);
  }
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [vendorProfileForm, setVendorProfileForm] = useState({ businessName: "", category: "", location: "", priceRange: "", description: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [vendorProfileSaved, setVendorProfileSaved] = useState(false);
  const [vendorPortfolio, setVendorPortfolio] = useState<Array<{ id: string; mediaType: string; url: string; thumbnailUrl?: string; caption?: string; description?: string; priceRange?: string; sortOrder: number }>>([]);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolioForm, setPortfolioForm] = useState({ title: "", description: "", priceRange: "", mediaType: "IMAGE" as string });
  const [portfolioImageFile, setPortfolioImageFile] = useState<File | null>(null);
  const [portfolioImagePreview, setPortfolioImagePreview] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [isSavingPortfolio, setIsSavingPortfolio] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMaxifyEventId, setSelectedMaxifyEventId] = useState<string>("");
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null);
  const [eventAnalytics, setEventAnalytics] = useState<EventAnalytics | null>(null);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [maxifyIntegration, setMaxifyIntegration] = useState<MaxifyIntegrationInfo | null>(null);
  const [isLoadingMaxify, setIsLoadingMaxify] = useState(false);
  const [maxifyError, setMaxifyError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ firstName: user.firstName || "", lastName: user.lastName || "" });
    }
  }, [user]);

  async function loadEnquiries() {
    setIsLoadingEnquiries(true);
    setEnquiryError(null);
    const result = await getEnquiries(getAuthToken() ?? undefined);
    if (result.error) setEnquiryError(result.error);
    else setEnquiries(enquiryList(result.data));
    setIsLoadingEnquiries(false);
  }

  async function loadEvents() {
    setIsLoadingEvents(true);
    setEventsError(null);
    const result = await getEvents(getAuthToken() ?? undefined);
    if (result.error) {
      setEventsError(result.error);
    } else if (result.data) {
      setEvents(result.data);
    }
    setIsLoadingEvents(false);
  }

  async function loadVendors() {
    const result = await getVendors(getAuthToken() ?? undefined);
    if (result.error) return;
    const liveVendors = Array.isArray(result.data) ? result.data : [];
    setVendorList(liveVendors);
  }

  function showAllEnquiries() {
    setActiveSection("Messages");
    void loadEnquiries();
  }

  function goToMyEvents() {
    router.push("/events");
  }

  async function loadMaxifyData(eventId: string) {
    if (!eventId) {
      setTicketStats(null);
      setAttendanceData(null);
      setEventAnalytics(null);
      setGuestStats(null);
      setMaxifyIntegration(null);
      return;
    }

    setIsLoadingMaxify(true);
    setMaxifyError(null);

    const [integrationResult, statsResult, attendanceResult, analyticsResult, guestResult] = await Promise.all([
      getMaxifyIntegrationInfo(eventId),
      getTicketStats(eventId),
      getAttendanceData(eventId),
      getEventAnalytics(eventId),
      getGuestStats(eventId),
    ]);

    if (integrationResult.error) setMaxifyError(integrationResult.error);
    setMaxifyIntegration(integrationResult.data ?? null);
    setTicketStats(statsResult.data ?? null);
    setAttendanceData(attendanceResult.data ?? null);
    setEventAnalytics(analyticsResult.data ?? null);
    setGuestStats(guestResult.data ?? null);
    setIsLoadingMaxify(false);
  }

  async function handleSyncMaxify() {
    if (!selectedMaxifyEventId) return;
    setIsSyncing(true);
    const result = await syncMaxifyEvent(selectedMaxifyEventId);
    if (result.error) {
      setMaxifyError(result.error);
    } else {
      void loadMaxifyData(selectedMaxifyEventId);
    }
    setIsSyncing(false);
  }

  async function handleConnectMaxify() {
    if (!selectedMaxifyEventId) return;
    setIsSyncing(true);
    const result = await connectMaxifyEvent(selectedMaxifyEventId);
    if (result.error) {
      setMaxifyError(result.error);
    } else {
      void loadMaxifyData(selectedMaxifyEventId);
    }
    setIsSyncing(false);
  }

  useEffect(() => {
    if (events.length > 0 && !selectedMaxifyEventId) {
      setSelectedMaxifyEventId(events[0].id);
    }
  }, [events, selectedMaxifyEventId]);

  useEffect(() => {
    if (selectedMaxifyEventId) {
      void loadMaxifyData(selectedMaxifyEventId);
    }
  }, [selectedMaxifyEventId]);

  useEffect(() => {
    const authUser = getAuthUser();
    setUser(authUser);

    if (process.env.NODE_ENV !== 'production') {
      console.log('[auth] DashboardClient mount', { hasUser: !!authUser, role: authUser?.role });
    }

    if (authUser) {
        setIsLoading(false);
        void loadEnquiries();
        if (authUser.role.toUpperCase() === "PLANNER") {
          void loadEvents();
        }
        if (authUser.role.toUpperCase() === "VENDOR") {
        void loadVendors();
        void getMyVendorProfile(getAuthToken() ?? undefined).then((result) => {
          if (!result.error && result.data) {
            setVendorProfileForm({
              businessName: result.data.businessName ?? "",
              category: result.data.category ?? "",
              location: result.data.location ?? "",
              priceRange: result.data.priceRange ?? "",
              description: result.data.description ?? "",
            });
          }
        });
        void getMyAvailability(getAuthToken() ?? undefined).then((result) => {
          if (!result.error) setUnavailableDates(result.data?.unavailableDates ?? []);
        });
        void loadPortfolio();
      }

      const enquiryRefresh = window.setInterval(() => {
        void loadEnquiries();
      }, 5_000);

      return () => window.clearInterval(enquiryRefresh);
    } else {
      router.replace("/signin");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function blockAvailabilityDate() {
    if (!availabilityDate || unavailableDates.includes(availabilityDate)) return;
    const dates = [...unavailableDates, availabilityDate].sort();
    const result = await updateMyAvailability({ unavailableDates: dates }, getAuthToken() ?? undefined);
    if (result.error) return setAvailabilityError(result.error);
    setUnavailableDates(dates);
    setAvailabilityDate("");
    setAvailabilityError(null);
  }

  async function unblockAvailabilityDate(date: string) {
    const dates = unavailableDates.filter((item) => item !== date);
    const result = await updateMyAvailability({ unavailableDates: dates }, getAuthToken() ?? undefined);
    if (result.error) return setAvailabilityError(result.error);
    setUnavailableDates(dates);
    setAvailabilityError(null);
  }

  async function loadPortfolio() {
    const result = await getMyVendorProfile(getAuthToken() ?? undefined);
    if (!result.error && result.data?.portfolioItems) {
      setVendorPortfolio(result.data.portfolioItems);
    }
  }

  async function reviewEnquiry(id: string, status: "ACCEPTED" | "DECLINED") {
    const result = await updateEnquiryStatus(id, status, getAuthToken() ?? undefined);
    if (result.error) {
      setEnquiryError(result.error);
      return;
    }
    const updated = result.data?.data;
    setEnquiries((current) => current.map((enquiry) => enquiry.id === id ? {
      ...enquiry,
      ...(updated ?? {}),
      status: updated?.status ?? (status === "ACCEPTED" ? "BOOKED" : "DECLINED"),
    } : enquiry));
  }

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => {
      URL.revokeObjectURL(url);
      setPreviewUrl(null);
    };
  }, [selectedFile]);

  useEffect(() => {
    if (activeSection === "My Events") {
      router.push("/events");
    }
  }, [activeSection, router]);

  async function handleSaveProfile() {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      let updatedUser = { ...(user as User) };

      if (selectedFile) {
        const uploadResult = await uploadProfileImage(selectedFile, getAuthToken() ?? undefined);
        if (uploadResult.error) {
          setSaveError(uploadResult.error);
          setIsSaving(false);
          return;
        }
        const avatarUrl = uploadResult.data?.avatar;
        if (avatarUrl) {
          updatedUser = { ...updatedUser, avatar: avatarUrl };
          saveAuthUser(updatedUser);
          setUser(updatedUser);
        }
      }

      const payload: Partial<User> = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
      };

      const res = await updateProfile(payload);
      if (res.error || !res.data) {
        setSaveError(res.error ?? "Update failed");
        setIsSaving(false);
        return;
      }

      const finalUser = { ...updatedUser, ...(res.data as User) };
      saveAuthUser(finalUser);
      setUser(finalUser);
      setSelectedFile(null);
    } catch (err) {
      setSaveError(String((err as Error)?.message ?? String(err)));
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <p className="text-lg font-medium text-slate-700">Loading your dashboard…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">Loading...</h1>
        </div>
      </main>
    );
  }

  const role = user.role?.toUpperCase?.() ?? "";
  const isPlanner = role === "PLANNER";
  const isVendor = role === "VENDOR";
  const greetingName = user.firstName || user.email.split("@")[0];
  const hour = new Date().getHours();
  const greetingTime = hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 18 ? "afternoon" : "evening";
  const currentEnquiries = enquiryList(enquiries);
  const pendingEnquiries = currentEnquiries.filter((enquiry) => enquiry.status?.toUpperCase?.() === "NEW");
  const acceptedEnquiries = currentEnquiries.filter((enquiry) => enquiry.status?.toUpperCase?.() === "BOOKED");
  const unreadMessageCount = currentEnquiries.filter((enquiry) => enquiry.chatRoom?.id && !readChatIds.has(enquiry.id)).length;
  const statusCards = [
    { title: "Waiting for Response", subtitle: "Awaiting vendor reply", value: pendingEnquiries.length, accent: "bg-amber-100 text-amber-700" },
    { title: "Accepted", subtitle: "Confirmed bookings", value: acceptedEnquiries.length, accent: "bg-emerald-100 text-emerald-700" },
    { title: "Total enquiries", subtitle: "All booking requests", value: currentEnquiries.length, accent: "bg-sky-100 text-sky-700" },
  ];
  const vendorStatus = [
    { title: "New enquiries", subtitle: "Awaiting your response", value: pendingEnquiries.length, accent: "bg-amber-100 text-amber-700" },
    { title: "Confirmed bookings", subtitle: "Accepted requests", value: acceptedEnquiries.length, accent: "bg-emerald-100 text-emerald-700" },
    { title: "Total enquiries", subtitle: "All planner requests", value: currentEnquiries.length, accent: "bg-sky-100 text-sky-700" },
  ];
  const eventTypes = [...new Set(currentEnquiries.map((enquiry) => enquiry.eventType).filter(Boolean))];
  const recommendedVendors = vendorList.slice(0, 4);
  const vendorEnquiries = currentEnquiries;
  const plannerEnquiriesForUser = currentEnquiries;
  const vendorBookings = acceptedEnquiries;
  const plannerNotifications = currentEnquiries.slice(0, 5).map((enquiry) => ({
    headline: `${enquiry.status} — ${contactName(enquiry, "PLANNER")}`,
    detail: `${enquiry.eventType} on ${enquiry.eventDate}`,
    time: enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : "Recent",
  }));

  if (isVendor) {
    const vendorName = user.firstName || user.email.split("@")[0];

    return (
      <div className="flex min-h-screen flex-col bg-slate-100">
        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1700px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 rounded-[28px] bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                     <Image
                       src={user.avatar}
                       alt={`${vendorName} profile`}
                       width={48}
                       height={48}
                       className="rounded-full object-cover"
                       onError={(e) => {
                         const target = e.currentTarget;
                         target.onerror = null;
                         target.src = FALLBACK_AVATAR_IMAGE;
                       }}
                     />
                    ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white shadow-sm">
                      {(() => {
                        const initials = [user.firstName, user.lastName]
                          .filter(Boolean)
                          .map((name) => name?.[0].toUpperCase())
                          .join("");
                        return initials || "V";
                      })()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{user.firstName} {user.lastName}</p>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Vendor</p>
                  </div>
                </div>
              </div>

              <nav className="space-y-1">
                {vendorNavItems.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setActiveVendorSection(item)}
                    className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                      activeVendorSection === item
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </nav>

              <div className="mt-10 rounded-[28px] bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Need support?</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Our vendor success team can help with enquiries, payments, and profile updates.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  clearAuth();
                  router.replace("/");
                }}
                className="mt-6 flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </aside>

            <section className="space-y-6">
              <header className="rounded-[32px] bg-white p-6 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-500">Welcome back, {vendorName} 👋</p>
                  <div className="flex items-center gap-4">
                     <h1 className="mt-3 text-2xl font-semibold text-slate-950 sm:text-3xl">{activeVendorSection}</h1>
                  </div>
                </div>
              </header>

              {activeVendorSection === "Dashboard" ? (
                <>
                  {pendingEnquiries.length > 0 ? <div role="status" className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><span className="font-semibold">New booking request{pendingEnquiries.length === 1 ? "" : "s"} received.</span> Review {pendingEnquiries.length === 1 ? "it" : "them"} in Notifications.</div> : null}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    {vendorStatus.map((card) => (
                      <div key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${card.accent}`}>
                          {card.title}
                        </div>
                        <p className="mt-5 text-3xl font-semibold text-slate-950">{card.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{card.subtitle}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
                    <div className="rounded-[32px] bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                           <p className="text-sm font-semibold text-slate-500">Latest notifications</p>
                           <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recent planner enquiries</h2>
                         </div>
                         <button type="button" onClick={() => setActiveVendorSection("Notifications")} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                           View all
                         </button>
                      </div>

                      <div className="mt-6 space-y-4">
                        {vendorEnquiries.slice(0, 4).map((enquiry) => (
                          <div key={enquiry.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">{contactName(enquiry, "VENDOR")}</p>
                                <p className="text-sm text-slate-600">{enquiry.eventType} · {enquiry.eventDate}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span>{enquiry.budget || "Budget not specified"}</span>
                                <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
                                  {enquiry.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="rounded-[32px] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">Performance</p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Weekly engagement</h2>
                          </div>
                        </div>

                        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          {pendingEnquiries.length > 0
                            ? `${pendingEnquiries.length} enquiry${pendingEnquiries.length === 1 ? "" : "ies"} need your response.`
                            : "You have no enquiries awaiting a response."}
                        </div>
                      </div>

                      <div className="rounded-[32px] bg-white p-6 shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Quick actions</p>
                          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recommended next steps</h2>
                        </div>

                        <div className="mt-6 space-y-4">
                          <button className="w-full rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                            Refresh your availability calendar
                          </button>
                          <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                            Send a follow-up message to new enquiries
                          </button>
                          <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                            Highlight your best package in your portfolio
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : activeVendorSection === "Notifications" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Open notifications</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Your incoming requests</h2>
                    </div>
                    <button type="button" onClick={loadEnquiries} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Refresh list
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {enquiryError ? <p role="alert" className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{enquiryError}</p> : null}
                    {isLoadingEnquiries ? <p className="text-sm text-slate-500">Loading requests…</p> : null}
                    {vendorEnquiries.map((enquiry) => (
                      <div key={enquiry.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{contactName(enquiry, "VENDOR")}</p>
                            <p className="mt-1 text-sm text-slate-600">{enquiry.eventType} · {enquiry.eventDate} · {enquiry.guestCount} guests</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span>{enquiry.budget || "Budget not specified"}</span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{enquiry.status}</span>
                            {enquiry.status === "NEW" ? <><button type="button" onClick={() => reviewEnquiry(enquiry.id, "ACCEPTED")} className="rounded-full bg-emerald-600 px-3 py-1 font-semibold text-white">Accept</button><button type="button" onClick={() => reviewEnquiry(enquiry.id, "DECLINED")} className="rounded-full border border-slate-200 bg-white px-3 py-1 font-semibold text-slate-700">Decline</button></> : null}
                             {enquiry.chatRoom?.id ? <button type="button" onClick={() => openChat(enquiry)} className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white">Chat</button> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                    {!isLoadingEnquiries && vendorEnquiries.length === 0 && !enquiryError ? <p className="text-sm text-slate-500">No planner requests yet.</p> : null}
                  </div>
                </div>
              ) : activeVendorSection === "Bookings" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Confirmed work</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Upcoming bookings</h2>
                    </div>
                    <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Export schedule
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {vendorBookings.map((booking) => (
                      <div key={booking.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{contactName(booking, "VENDOR")}</p>
                            <p className="mt-1 text-sm text-slate-600">{booking.eventType} · {booking.eventLocation}</p>
                          </div>
                          <div className="text-sm text-slate-500 sm:text-right">
                            <p>{booking.eventDate}</p>
                            <p className="mt-1 font-semibold text-slate-900">{booking.budget || "Budget not specified"}</p>
                            <span className="mt-1 inline-flex rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{booking.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {!isLoadingEnquiries && vendorBookings.length === 0 ? <p className="text-sm text-slate-500">No accepted bookings yet.</p> : null}
                  </div>
                </div>
              ) : activeVendorSection === "Messages" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Inbox</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recent messages</h2>
                    </div>
                    <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      New message
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {vendorEnquiries.filter((enquiry) => enquiry.chatRoom?.id).map((enquiry) => (
                       <button type="button" key={enquiry.id} onClick={() => openChat(enquiry)} className="w-full rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-left">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{contactName(enquiry, "VENDOR")}</p>
                            <p className="mt-1 text-sm text-slate-600">{enquiry.eventType} enquiry</p>
                            <p className="mt-2 text-sm text-slate-500">{enquiry.specialNotes || "Open conversation"}</p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : "Recent"}</p>
                        </div>
                      </button>
                    ))}
                    {!isLoadingEnquiries && vendorEnquiries.length === 0 ? <p className="text-sm text-slate-500">No conversations yet.</p> : null}
                  </div>
                </div>
              ) : activeVendorSection === "Availability" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500">Availability calendar</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Block dates you cannot take bookings</h2>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <input type="date" min={new Date().toISOString().slice(0, 10)} value={availabilityDate} onChange={(event) => setAvailabilityDate(event.target.value)} className="rounded-2xl border border-slate-200 px-4 py-3" />
                    <button type="button" onClick={blockAvailabilityDate} disabled={!availabilityDate} className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:bg-slate-300">Block date</button>
                  </div>
                  {availabilityError ? <p role="alert" className="mt-4 text-sm text-rose-600">{availabilityError}</p> : null}
                  <div className="mt-6 flex flex-wrap gap-3">
                    {unavailableDates.length ? unavailableDates.map((date) => <button type="button" key={date} onClick={() => unblockAvailabilityDate(date)} className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">{date} ×</button>) : <p className="text-sm text-slate-500">No dates are blocked. You are available for bookings.</p>}
                  </div>
                </div>
              ) : activeVendorSection === "Profile" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Vendor profile</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Edit your profile</h2>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4">
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-semibold text-slate-900">Listing details</p>
                        <p className="mt-1 text-sm text-slate-600">Complete these fields to publish your listing and receive booking requests.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <input value={vendorProfileForm.businessName} onChange={(e) => setVendorProfileForm((profile) => ({ ...profile, businessName: e.target.value }))} placeholder="Business name" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                          <input value={vendorProfileForm.category} onChange={(e) => setVendorProfileForm((profile) => ({ ...profile, category: e.target.value }))} placeholder="Service category" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                          <input value={vendorProfileForm.location} onChange={(e) => setVendorProfileForm((profile) => ({ ...profile, location: e.target.value }))} placeholder="Location" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                          <input value={vendorProfileForm.priceRange} onChange={(e) => setVendorProfileForm((profile) => ({ ...profile, priceRange: e.target.value }))} placeholder="Price range (optional)" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                        </div>
                        <textarea value={vendorProfileForm.description} onChange={(e) => setVendorProfileForm((profile) => ({ ...profile, description: e.target.value }))} placeholder="Describe your services, experience, and what makes you stand out." rows={4} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                        <button type="button" onClick={saveVendorProfile} disabled={isSaving || !vendorProfileForm.businessName || !vendorProfileForm.category || !vendorProfileForm.location} className="mt-4 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                          {isSaving ? "Saving..." : "Save and publish listing"}
                        </button>
                        {vendorProfileSaved ? <p className="mt-2 text-sm text-emerald-700">Listing saved and published.</p> : null}
                        {saveError ? <p className="mt-2 text-sm text-rose-600">{saveError}</p> : null}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                        <input
                          value={profileForm.firstName}
                          onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                          placeholder="First name"
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                        />
                        <input
                          value={profileForm.lastName}
                          onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                          placeholder="Last name"
                          className="w-full rounded-2xl border border-slate-200 px-4 py-3"
                        />
                      </div>

                      <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Email</p>
                          <p className="text-sm text-slate-700">{user.email}</p>
                        </div>
                        <label className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          Upload avatar
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                            className="mt-2 w-full text-sm"
                          />
                        </label>
                      </div>

                      {previewUrl && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Preview</p>
                           <Image src={previewUrl} alt="avatar preview" width={96} height={96} className="mt-3 h-24 w-24 rounded-full object-cover" />
                        </div>
                      )}

                      {saveError && <p className="text-sm text-rose-600">{saveError}</p>}
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          className="rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isSaving ? "Saving..." : "Save changes"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setProfileForm({ firstName: user.firstName || "", lastName: user.lastName || "" })}
                          className="rounded-3xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeVendorSection === "Portfolio" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Portfolio</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Showcase your work</h2>
                    </div>
                    <button type="button" onClick={() => setShowPortfolioForm((current) => !current)} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      {showPortfolioForm ? "Close" : "Add new item"}
                    </button>
                  </div>

                  {showPortfolioForm ? (
                    <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input value={portfolioForm.title} onChange={(e) => setPortfolioForm((form) => ({ ...form, title: e.target.value }))} placeholder="Project title" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                        <select value={portfolioForm.mediaType} onChange={(e) => setPortfolioForm((form) => ({ ...form, mediaType: e.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
                          <option value="IMAGE">Image</option>
                          <option value="VIDEO">Video</option>
                        </select>
                        <input value={portfolioForm.priceRange} onChange={(e) => setPortfolioForm((form) => ({ ...form, priceRange: e.target.value }))} placeholder="Price range (optional)" className="rounded-2xl border border-slate-200 bg-white px-4 py-3" />
                      </div>
                      <textarea value={portfolioForm.description} onChange={(e) => setPortfolioForm((form) => ({ ...form, description: e.target.value }))} placeholder="Describe this project or package..." rows={3} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm" />
                      <label className="mt-3 block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 cursor-pointer">
                        Upload work {portfolioForm.mediaType === "VIDEO" ? "video" : "photo"}
                        <input type="file" accept={portfolioForm.mediaType === "VIDEO" ? "video/*" : "image/*"} className="mt-2 w-full text-sm" onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          setPortfolioImageFile(file);
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = () => setPortfolioImagePreview(reader.result as string);
                            reader.readAsDataURL(file);
                          } else {
                            setPortfolioImagePreview(null);
                          }
                        }} />
                      </label>
                      {portfolioImagePreview ? (
                        <div className="mt-3">
                          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Preview</p>
                           <Image src={portfolioImagePreview} alt="portfolio preview" width={160} height={160} className="mt-2 h-40 w-40 rounded-2xl object-cover" />
                        </div>
                      ) : null}
                      {portfolioError ? <p className="mt-2 text-sm text-rose-600">{portfolioError}</p> : null}
                      <button type="button" onClick={handleAddPortfolioItem} disabled={isSavingPortfolio} className="mt-4 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300">
                        {isSavingPortfolio ? "Saving..." : "Add"}
                      </button>
                    </div>
                  ) : null}

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      {vendorPortfolio.map((item) => (
                        <div key={item.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" onClick={() => void handleDeletePortfolioItem(item.id)} className="rounded-full bg-white/90 p-2.5 text-slate-500 shadow-sm transition hover:bg-rose-50 hover:text-rose-600 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Delete portfolio item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M3 6h18" />
                                <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
                                <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => alert("Edit feature coming soon")} className="rounded-full bg-white/90 p-2.5 text-slate-500 shadow-sm transition hover:bg-blue-50 hover:text-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Edit portfolio item">
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 4 22l1.5-5.5L17 3z" />
                              </svg>
                            </button>
                          </div>
                          {item.url ? (
                            item.mediaType === "VIDEO" ? (
                              <video src={item.url} controls className="mt-3 h-48 w-full rounded-2xl object-cover" />
                            ) : (
                               <Image src={item.url} alt={item.caption ?? "Portfolio item"} width={600} height={400} className="mt-3 h-48 w-full rounded-2xl object-cover" style={{ width: 'auto', height: 'auto' }} />
                            )
                          ) : null}
                          {item.caption ? <p className="mt-3 text-sm font-semibold text-slate-900">{item.caption}</p> : null}
                          {item.description ? <p className="mt-2 text-sm text-slate-600">{item.description}</p> : null}
                          {item.priceRange ? <p className="mt-2 text-sm font-semibold text-blue-700">{item.priceRange}</p> : null}
                        </div>
                      ))}
                    </div>
                  {vendorPortfolio.length === 0 ? <p className="mt-4 text-sm text-slate-500">No portfolio items yet. Add your first project above.</p> : null}
                </div>
              ) : null
            }
             </section>
          </div>
         </main>

        {chatEnquiry ? <EnquiryChat enquiry={chatEnquiry} currentUser={user as User} onClose={() => setChatEnquiry(null)} /> : null}
      </div>
    );
  }

  async function saveVendorProfile() {
    setIsSaving(true);
    setSaveError(null);
    setVendorProfileSaved(false);
    const result = await updateMyVendorProfile(vendorProfileForm, getAuthToken() ?? undefined);
    setIsSaving(false);
    if (result.error) {
      setSaveError(result.error);
    } else {
      setVendorProfileSaved(true);
      setTimeout(() => setVendorProfileSaved(false), 3000);
    }
  }

  async function handleAddPortfolioItem() {
    setPortfolioError(null);
    if (!portfolioForm.title.trim() || !portfolioImageFile) {
      setPortfolioError("Please provide a title and upload a photo or video.");
      return;
    }

    setIsSavingPortfolio(true);
    const formData = new FormData();
    formData.append("media", portfolioImageFile);
    formData.append("caption", portfolioForm.title);
    formData.append("priceRange", portfolioForm.priceRange);
    formData.append("mediaType", portfolioForm.mediaType);
    if (portfolioForm.description.trim()) {
      formData.append("description", portfolioForm.description);
    }

    const result = await createPortfolioItem(formData, getAuthToken() ?? undefined);
    setIsSavingPortfolio(false);
    if (result.error) {
      setPortfolioError(result.error);
    } else {
      await loadPortfolio();
      setPortfolioForm({ title: "", description: "", priceRange: "", mediaType: "IMAGE" });
      setPortfolioImageFile(null);
      setPortfolioImagePreview(null);
      setShowPortfolioForm(false);
    }
  }

  async function handleDeletePortfolioItem(id: string) {
    const confirmed = window.confirm("Delete this portfolio item? This action cannot be undone.");
    if (!confirmed) return;
    const result = await deletePortfolioItem(id, getAuthToken() ?? undefined);
    if (result.error) {
      setPortfolioError(result.error);
    } else {
      await loadPortfolio();
    }
  }

  if (!isPlanner) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-950">Unsupported dashboard role</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Your account role is not supported for this dashboard. Please sign in with a planner or vendor account.
          </p>
          <button
            type="button"
            onClick={() => {
              clearAuth();
              router.replace("/");
            }}
            className="mt-6 rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Go to sign in
          </button>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1700px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Mobile sidebar toggle */}
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setSidebarOpen((open) => !open)}
              className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
              {sidebarOpen ? "Close menu" : "Open menu"}
            </button>
          </div>

          {/* Sidebar overlay for mobile */}
          {sidebarOpen ? (
            <div className="fixed inset-0 z-40 bg-slate-900/40 xl:hidden" onClick={() => setSidebarOpen(false)} />
          ) : null}

          <aside className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm xl:relative xl:block xl:translate-x-0 fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="mb-6 flex items-center justify-between xl:hidden">
              <p className="text-sm font-semibold text-slate-950">Menu</p>
              <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mb-6">
              <Logo iconOnly size="lg" className="text-lg" />
            </div>

            <nav className="space-y-1" aria-label="Planner navigation">
              {plannerNavItems.map((item) => {
                const showStatusDot = item.id === "MaxifyTickets" && isPlanner;
                const isActive = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => {
                      if (item.id === "My Events") {
                        goToMyEvents();
                      } else {
                        setActiveSection(item.id);
                        if (item.id === "MaxifyTickets") {
                          setMaxifySubPage("Overview");
                        }
                      }
                    }}
                    className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                      isActive
                        ? "bg-blue-600 text-white shadow"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                    {item.image ? (
                      <span className="flex-1">{item.image}</span>
                    ) : (
                      <span className="flex-1">{item.label}</span>
                    )}
                    {showStatusDot && (
                      <span
                        className={`h-2 w-2 flex-shrink-0 rounded-full ${
                          maxifyIntegration
                            ? "bg-emerald-500"
                            : selectedMaxifyEventId
                              ? "bg-amber-500"
                              : "bg-slate-400"
                        }`}
                        title={
                          maxifyIntegration
                            ? "MaxifyTickets connected"
                            : selectedMaxifyEventId
                              ? "MaxifyTickets not connected"
                              : "Select an event"
                        }
                      />
                    )}
                  </button>
                );
              })}
            </nav>

          <div className="my-4 border-t border-slate-200" />

          <div className="mt-10 rounded-[28px] bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Need help?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reach out to support for booking or vendor guidance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearAuth();
              router.replace("/");
            }}
            className="mt-6 flex w-full items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </aside>

        <section className="space-y-6">
          {activeSection === "Dashboard" ? (
            <>
              {/* Dashboard top bar */}
              <div className="rounded-[32px] bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <Search className="h-5 w-5 text-slate-400" />
                    <input
                      type="search"
                      placeholder="Search events, vendors, enquiries..."
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveSection("Messages")}
                      className="rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition hover:bg-slate-100"
                      aria-label="Messages"
                    >
                      <Message className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("Messages")}
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
                      onClick={() => setActiveSection("Profile")}
                      className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 pl-1 pr-3 py-1 transition hover:bg-slate-100"
                      aria-label="Profile"
                    >
                      {user.avatar ? (
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
                            const initials = [user.firstName, user.lastName]
                              .filter(Boolean)
                              .map((name) => name?.[0].toUpperCase())
                              .join("");
                            return initials || "U";
                          })()}
                        </div>
                      )}
                      <span className="hidden sm:block text-sm font-semibold text-slate-700">
                        {user.firstName} {user.lastName}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Welcome + Quick Actions */}
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Good {greetingTime}, {greetingName} 👋</p>
                    <h1 className="mt-2 text-2xl font-semibold text-slate-950 sm:text-3xl">Here&apos;s what&apos;s happening with your events.</h1>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push("/events/new")}
                      className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      <Plus className="h-4 w-4" />
                      Create Event
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("Discover Vendors")}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Search className="h-4 w-4" />
                      Find Vendor
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("MaxifyTickets")}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Ticket className="h-4 w-4" />
                      Manage Tickets
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection("Messages")}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Message className="h-4 w-4" />
                      View Messages
                    </button>
                  </div>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <button
                  type="button"
                  onClick={() => router.push("/events")}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm text-left transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Active Events</p>
                    <Calendar className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">
                    {isLoadingEvents ? "..." : events.filter((e) => e.status === "LAUNCHED" || e.status === "READY").length}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Ready or live right now</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("Discover Vendors")}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm text-left transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Vendors Booked</p>
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{acceptedEnquiries.length}</p>
                  <p className="mt-2 text-xs text-slate-500">Confirmed bookings</p>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSection("Messages")}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm text-left transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Open Enquiries</p>
                    <Message className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">{pendingEnquiries.length}</p>
                  <p className="mt-2 text-xs text-slate-500">Awaiting vendor reply</p>
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/events")}
                  className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm text-left transition hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Guests Registered</p>
                    <Users className="h-5 w-5 text-slate-400" />
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-950">
                    {isLoadingEvents ? "..." : events.reduce((sum, event) => sum + (event.guestCount || 0), 0)}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">Across all events</p>
                </button>
              </div>

              {/* Two Column Layout */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Upcoming & Active Events */}
                  <div className="rounded-[32px] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">My Events</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Upcoming & active</h2>
                      </div>
                      <button type="button" onClick={() => router.push("/events")} className="text-sm font-semibold text-blue-600 hover:underline">
                        View all
                      </button>
                    </div>
                    <div className="mt-6 space-y-4">
                      {isLoadingEvents ? (
                        <p className="text-sm text-slate-500">Loading events...</p>
                      ) : eventsError ? (
                        <p className="text-sm text-red-600">{eventsError}</p>
                      ) : events.length === 0 ? (
                         <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                           <p className="text-sm text-slate-600">No events yet. Create your first event to get started.</p>
                           <button
                             type="button"
                             onClick={() => router.push("/events/new")}
                             className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                           >
                             Create Event
                           </button>
                         </div>
                       ) : (
                        events.slice(0, 3).map((event) => (
                          <div key={event.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-950">{event.name}</p>
                                <p className="mt-1 text-sm text-slate-600">{event.eventType} · {new Date(event.eventDate).toLocaleDateString()}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                  <span>{event.location}</span>
                                  <span>·</span>
                                  <span>{event.guestCount} guests</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                                  {event.status}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => router.push(`/events/${event.id}`)}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                                >
                                  Open Event
                                </button>
                              </div>
                            </div>
                            {event.readinessScore > 0 && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-slate-600">Event Health</span>
                                  <span className="font-semibold text-slate-900">{event.readinessScore}%</span>
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
                        ))
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="rounded-[32px] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Recent Activity</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Latest updates</h2>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {plannerNotifications.length === 0 ? (
                        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                          <p className="text-sm text-slate-600">No recent activity yet.</p>
                        </div>
                      ) : (
                        plannerNotifications.map((notification, idx) => (
                          <div key={`${notification.headline}-${idx}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-sm font-semibold text-slate-950">{notification.headline}</p>
                            <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{notification.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Event Health Overview */}
                  <div className="rounded-[32px] bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-500">Event Health</p>
                        <h2 className="mt-1 text-2xl font-semibold text-slate-950">Overview</h2>
                      </div>
                    </div>
                    <div className="mt-6 space-y-4">
                      {isLoadingEvents ? (
                        <p className="text-sm text-slate-500">Loading...</p>
                      ) : eventsError ? (
                        <p className="text-sm text-red-600">{eventsError}</p>
                      ) : events.length === 0 ? (
                         <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                           <p className="text-sm text-slate-600">Create an event to start tracking event health.</p>
                           <button
                             type="button"
                             onClick={() => router.push("/events/new")}
                             className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                           >
                             Create Event
                           </button>
                         </div>
                       ) : (
                        events.slice(0, 4).map((event) => (
                          <div key={event.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-semibold text-slate-950">{event.name}</p>
                              <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                                {event.status}
                              </span>
                            </div>
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-600">Readiness</span>
                                <span className="font-semibold text-slate-900">{event.readinessScore}%</span>
                              </div>
                              <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-200">
                                <div
                                  className="h-full rounded-full bg-blue-600 transition-all"
                                  style={{ width: `${event.readinessScore}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                    {/* MaxifyTickets Overview */}
                    <div className="rounded-[32px] bg-white p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-500">Ticketing</p>
                          <Image
                            src="/image.png"
                            alt="Maxify Tickets"
                            width={120}
                            height={36}
                            className="mt-1 h-9 w-auto object-contain"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveSection("MaxifyTickets")}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            Manage Tickets
                          </button>
                        </div>
                      </div>
                     <div className="mt-6">
                       {!selectedMaxifyEventId || !maxifyIntegration ? (
                         <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center">
                           <p className="text-sm text-slate-600">Connect MaxifyTickets</p>
                           <p className="mt-2 text-xs text-slate-500">Set up ticketing for your events and start managing registrations.</p>
                           <button
                             type="button"
                             onClick={handleConnectMaxify}
                             disabled={isSyncing || !selectedMaxifyEventId}
                             className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                           >
                             {isSyncing ? "Connecting..." : "Connect MaxifyTickets"}
                           </button>
                         </div>
                       ) : isLoadingMaxify ? (
                         <p className="text-sm text-slate-500">Loading ticketing data...</p>
                       ) : ticketStats && ticketStats.ticketTypes.length > 0 ? (
                         <div className="space-y-4">
                           <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                             <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                               <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tickets Sold</p>
                               <p className="mt-3 text-2xl font-semibold text-slate-950">{ticketStats.totalSold}</p>
                             </div>
                             <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                               <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Remaining</p>
                               <p className="mt-3 text-2xl font-semibold text-slate-950">{ticketStats.totalCapacity - ticketStats.totalSold}</p>
                             </div>
                             <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                               <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Revenue</p>
                               <p className="mt-3 text-2xl font-semibold text-slate-950">
                                 {ticketStats.totalRevenue ? `₦${ticketStats.totalRevenue.toLocaleString()}` : "₦0"}
                               </p>
                             </div>
                             <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                               <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ticket Types</p>
                               <p className="mt-3 text-2xl font-semibold text-slate-950">{ticketStats.ticketTypes.length}</p>
                             </div>
                           </div>
                           <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                             <div className="flex items-center justify-between text-sm">
                               <span className="text-slate-600">Sales Progress</span>
                               <span className="font-semibold text-slate-900">{ticketStats.percentageSold}%</span>
                             </div>
                             <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                               <div
                                 className="h-full rounded-full bg-blue-600 transition-all"
                                 style={{ width: `${Math.min(ticketStats.percentageSold, 100)}%` }}
                               />
                             </div>
                             <p className="mt-2 text-xs text-slate-500">
                               {ticketStats.totalSold} of {ticketStats.totalCapacity} tickets sold
                             </p>
                           </div>
                           <div className="flex items-center gap-2">
                             <button
                               type="button"
                               onClick={() => setActiveSection("MaxifyTickets")}
                               className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                             >
                               Manage Tickets
                             </button>
                             <button
                               type="button"
                               onClick={() => setActiveSection("MaxifyTickets")}
                               className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                             >
                               View Attendees
                             </button>
                           </div>
                         </div>
                       ) : (
                         <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 text-center">
                           <p className="text-sm text-slate-600">No tickets created yet</p>
                           <p className="mt-2 text-xs text-slate-500">Create ticket types for your event.</p>
                           <button
                             type="button"
                             onClick={() => setActiveSection("MaxifyTickets")}
                             className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                           >
                             Create Tickets
                           </button>
                         </div>
                       )}
                     </div>
                   </div>

                   {/* Vendor Network */}
                   <div className="rounded-[32px] bg-white p-6 shadow-sm">
                     <div className="flex items-center justify-between">
                       <div>
                         <p className="text-sm font-semibold text-slate-500">Vendor Network</p>
                         <h2 className="mt-1 text-2xl font-semibold text-slate-950">Your network</h2>
                       </div>
                       <button type="button" onClick={() => setActiveSection("Discover Vendors")} className="text-sm font-semibold text-blue-600 hover:underline">
                         Find Vendors
                       </button>
                     </div>
                     <div className="mt-6 space-y-4">
                       {vendorList.length === 0 ? (
                         <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                           <p className="text-sm text-slate-600">No vendors booked yet.</p>
                           <p className="mt-1 text-xs text-slate-500">Find vendors for your next event.</p>
                           <button
                             type="button"
                             onClick={() => setActiveSection("Discover Vendors")}
                             className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                           >
                             Find Vendors
                           </button>
                         </div>
                       ) : (
                         vendorList.slice(0, 4).map((vendor) => (
                           <div key={vendor.id} className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                             <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
                               {vendor.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                             </div>
                             <div className="flex-1 min-w-0">
                               <p className="text-sm font-semibold text-slate-950 truncate">{vendor.name}</p>
                               <p className="text-xs text-slate-500">{vendor.category}</p>
                             </div>
                             <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                               {vendor.rating > 0 ? `★ ${vendor.rating}` : "New"}
                             </span>
                           </div>
                         ))
                       )}
                     </div>
                   </div>

                </div>
              </div>
            </>
          ) : activeSection === "Discover Vendors" ? (
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Discover Vendors</p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-950">Browse vendors by category, location, and rating</h2>
                </div>
              </div>
              <div className="mt-6">
                <VendorDirectory />
              </div>
            </div>
          ) : activeSection === "MaxifyTickets" ? (
            <>
              {/* Header */}
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Ticketing</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">MaxifyTickets</h2>
                    <p className="mt-2 text-sm text-slate-500">Manage ticketing, sales, and attendee check-ins for your events.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {maxifyIntegration?.isDemo && (
                      <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                        Partner Demo Environment
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSyncMaxify}
                      disabled={isSyncing || !selectedMaxifyEventId}
                      className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:bg-slate-200"
                    >
                      {isSyncing ? "Syncing..." : "Sync Now"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Event Selector */}
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <label htmlFor="maxify-event-select" className="text-sm font-semibold text-slate-700">Event:</label>
                    <select
                      id="maxify-event-select"
                      value={selectedMaxifyEventId}
                      onChange={(e) => setSelectedMaxifyEventId(e.target.value)}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20"
                    >
                      <option value="">Select an event</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>{event.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    {maxifyIntegration ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        Connected & Synced
                      </span>
                    ) : selectedMaxifyEventId ? (
                      <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                        <span className="h-2 w-2 rounded-full bg-amber-500" />
                        Not Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-600">
                        <span className="h-2 w-2 rounded-full bg-slate-400" />
                        Select an Event
                      </span>
                    )}
                  </div>
                </div>
                {!selectedMaxifyEventId && (
                  <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                    <p className="text-sm text-slate-600">No event selected. Choose an EventConnect event above to manage its ticketing.</p>
                  </div>
                )}
                {selectedMaxifyEventId && !maxifyIntegration && (
                  <div className="mt-6 rounded-[28px] border border-blue-200 bg-blue-50 p-8 text-center">
                    <p className="text-sm text-blue-800">Ticketing is not connected for this event.</p>
                    <button
                      type="button"
                      onClick={handleConnectMaxify}
                      disabled={isSyncing}
                      className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {isSyncing ? "Connecting..." : "Connect MaxifyTickets"}
                    </button>
                  </div>
                )}
              </div>

              {selectedMaxifyEventId && maxifyIntegration && (
                <>
                  {/* KPI Cards */}
                  <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tickets Sold</p>
                      <p className="mt-4 text-3xl font-semibold text-slate-950">
                        {isLoadingMaxify ? "..." : ticketStats?.totalSold ?? 0}
                      </p>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Checked In</p>
                      <p className="mt-4 text-3xl font-semibold text-slate-950">
                        {isLoadingMaxify ? "..." : attendanceData?.summary.checkedIn ?? 0}
                      </p>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Attendance Rate</p>
                      <p className="mt-4 text-3xl font-semibold text-slate-950">
                        {isLoadingMaxify ? "..." : `${attendanceData?.summary.attendanceRate ?? 0}%`}
                      </p>
                    </div>
                    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Ticket Revenue</p>
                      <p className="mt-4 text-3xl font-semibold text-slate-950">
                        {isLoadingMaxify ? "..." : ticketStats?.totalRevenue ? `₦${ticketStats.totalRevenue.toLocaleString()}` : "₦0"}
                      </p>
                    </div>
                  </div>

                  {/* Two Column Layout */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Ticket Sales Overview */}
                      <div className="rounded-[32px] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">Sales</p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Ticket Sales Overview</h2>
                          </div>
                        </div>
                        <div className="mt-6">
                          {isLoadingMaxify ? (
                            <p className="text-sm text-slate-500">Loading sales data...</p>
                          ) : ticketStats && ticketStats.ticketTypes.length > 0 ? (
                            <div className="space-y-4">
                              {ticketStats.ticketTypes.map((type) => (
                                <div key={type.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="text-sm font-semibold text-slate-950">{type.name}</p>
                                      <p className="mt-1 text-xs text-slate-500">₦{type.price.toLocaleString()} per ticket</p>
                                    </div>
                                    <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
                                      {type.percentageSold}% sold
                                    </span>
                                  </div>
                                  <div className="mt-3 flex items-center gap-4 text-sm text-slate-600">
                                    <span>{type.totalSold} sold</span>
                                    <span>·</span>
                                    <span>{type.maxCapacity - type.totalSold} remaining</span>
                                  </div>
                                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className="h-full rounded-full bg-blue-600 transition-all"
                                      style={{ width: `${type.percentageSold}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No ticket sales data available yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Recent Ticket Activity */}
                      <div className="rounded-[32px] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">Activity</p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recent Ticket Activity</h2>
                          </div>
                        </div>
                        <div className="mt-6 space-y-4">
                          {isLoadingMaxify ? (
                            <p className="text-sm text-slate-500">Loading activity...</p>
                          ) : attendanceData?.recentCheckIns && attendanceData.recentCheckIns.length > 0 ? (
                            attendanceData.recentCheckIns.slice(0, 5).map((checkIn) => (
                              <div key={checkIn.id} className="flex items-center justify-between rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                                    <Check className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-slate-950">{checkIn.name}</p>
                                    <p className="text-xs text-slate-500">{checkIn.ticketType} · {new Date(checkIn.checkedInAt).toLocaleString()}</p>
                                  </div>
                                </div>
                                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">Checked In</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-500">No recent ticket activity.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Attendee Check-ins */}
                      <div className="rounded-[32px] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">Check-ins</p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Attendee Check-ins</h2>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMaxifySubPage("Check-ins")}
                            className="text-sm font-semibold text-blue-600 hover:underline"
                          >
                            View Check-ins
                          </button>
                        </div>
                        <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Total Tickets</p>
                            <p className="mt-4 text-3xl font-semibold text-slate-950">
                              {isLoadingMaxify ? "..." : guestStats?.expectedGuests ?? attendanceData?.summary.registered ?? 0}
                            </p>
                          </div>
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Checked In</p>
                            <p className="mt-4 text-3xl font-semibold text-slate-950">
                              {isLoadingMaxify ? "..." : attendanceData?.summary.checkedIn ?? 0}
                            </p>
                          </div>
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Not Checked In</p>
                            <p className="mt-4 text-3xl font-semibold text-slate-950">
                              {isLoadingMaxify ? "..." : attendanceData?.summary.notCheckedIn ?? 0}
                            </p>
                          </div>
                          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Attendance Rate</p>
                            <p className="mt-4 text-3xl font-semibold text-slate-950">
                              {isLoadingMaxify ? "..." : `${attendanceData?.summary.attendanceRate ?? 0}%`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="rounded-[32px] bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-500">Quick Actions</p>
                            <h2 className="mt-1 text-2xl font-semibold text-slate-950">Manage Ticketing</h2>
                          </div>
                        </div>
                        <div className="mt-6 grid gap-3 grid-cols-1 sm:grid-cols-2">
                          <button
                            type="button"
                            onClick={() => setMaxifySubPage("Ticket Types")}
                            className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                          >
                            <p className="text-sm font-semibold text-slate-900">Create Ticket Type</p>
                            <p className="mt-1 text-xs text-slate-500">Add VIP, Regular, or custom tickets</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaxifySubPage("Overview")}
                            className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                          >
                            <p className="text-sm font-semibold text-slate-900">Manage Tickets</p>
                            <p className="mt-1 text-xs text-slate-500">View and edit ticket inventory</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaxifySubPage("Sales & Analytics")}
                            className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                          >
                            <p className="text-sm font-semibold text-slate-900">View Sales</p>
                            <p className="mt-1 text-xs text-slate-500">Track revenue and buyer data</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setMaxifySubPage("Check-ins")}
                            className="rounded-[28px] border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-slate-100"
                          >
                            <p className="text-sm font-semibold text-slate-900">View Check-ins</p>
                            <p className="mt-1 text-xs text-slate-500">Monitor attendee gate status</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : activeSection === "Messages" ? (
            <>
              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Your enquiries</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Active vendor conversations</h2>
                  </div>
                  <button type="button" onClick={loadEnquiries} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                    Refresh list
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {plannerEnquiriesForUser.map((enquiry) => (
                    <div key={enquiry.id} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{contactName(enquiry, "PLANNER")}</p>
                          <p className="mt-1 text-sm text-slate-600">{enquiry.eventType} · {enquiry.eventDate}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 text-sm text-slate-500 sm:items-end">
                          <span>{enquiry.budget || "Budget not specified"}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{enquiry.status}</span>
                           {enquiry.chatRoom?.id ? <button type="button" onClick={() => openChat(enquiry)} className="rounded-full bg-blue-600 px-3 py-1 font-semibold text-white">Chat</button> : null}
                        </div>
                      </div>
                    </div>
                  ))}
                  {!isLoadingEnquiries && plannerEnquiriesForUser.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-600">You have not sent any booking requests yet.</p>
                      <button
                        type="button"
                        onClick={() => setActiveSection("Discover Vendors")}
                        className="mt-4 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                      >
                        Find Vendors
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="rounded-[32px] bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Recent updates</p>
                    <h2 className="mt-1 text-2xl font-semibold text-slate-950">Notifications</h2>
                  </div>
                  <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                    Mark all read
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {plannerNotifications.length === 0 ? (
                    <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-8 text-center">
                      <p className="text-sm text-slate-600">No notifications yet.</p>
                    </div>
                  ) : (
                    plannerNotifications.map((notification, idx) => (
                      <div key={`${notification.headline}-${idx}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-semibold text-slate-950">{notification.headline}</p>
                        <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{notification.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : activeSection === "Profile" ? (
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Planner profile</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Your account details</h2>
              <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-800">Edit your profile</p>
                <div className="mt-3 grid gap-3">
                  <input
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, firstName: e.target.value }))}
                    placeholder="First name"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                  />
                  <input
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((p) => ({ ...p, lastName: e.target.value }))}
                    placeholder="Last name"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-2"
                  />
                  <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
                   {previewUrl && (
                     <Image src={previewUrl} alt="preview" width={80} height={80} className="h-20 w-20 rounded-full object-cover mt-2" />
                   )}
                  {saveError && <p className="text-sm text-rose-600">{saveError}</p>}
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleSaveProfile} disabled={isSaving} className="rounded-3xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold text-slate-500">Settings</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-950">Account settings</h2>
              <div className="mt-6 space-y-4">
                <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Notification preferences
                </button>
                <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Privacy settings
                </button>
                <button className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Manage account
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
      {bookingVendor ? (
        <BookingModal
          vendor={bookingVendor}
          onClose={() => setBookingVendor(null)}
          onBooked={(vendorName) => {
            setBookingNotice(`Booking request sent to ${vendorName}. The vendor can now review it in their dashboard.`);
            void loadEnquiries();
          }}
        />
      ) : null}
      {chatEnquiry ? <EnquiryChat enquiry={chatEnquiry} currentUser={user as User} onClose={() => setChatEnquiry(null)} /> : null}
    </div>
  );
}
