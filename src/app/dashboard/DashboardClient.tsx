"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getAuthToken, getAuthUser, getEnquiries, getMyAvailability, getMyVendorProfile, getVendors, saveAuthUser, type Enquiry, type User, updateEnquiryStatus, updateMyAvailability, updateMyVendorProfile, updateProfile, uploadProfileImage } from "@/lib/api";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { VendorCard } from "@/components/vendors/VendorCard";
import { BookingModal } from "@/components/vendors/BookingModal";
import { VendorDirectory } from "@/components/vendors/VendorDirectory";
import type { Vendor as DirectoryVendor } from "@/data/vendors";
import { Search, Bell } from "@/components/landing/icons";
import Image from "next/image";
import { EnquiryChat } from "@/components/enquiries/EnquiryChat";
import { FALLBACK_AVATAR_IMAGE, FALLBACK_VENDOR_IMAGE, getEventTypeImage } from "@/lib/images";

type PlannerSection =
  | "Dashboard"
  | "Discover Vendors"
  | "Messages"
  | "Profile"
  | "Settings";

const plannerNavItems: Array<{ id: PlannerSection; label: string }> = [
  { id: "Dashboard", label: "Dashboard" },
  { id: "Discover Vendors", label: "Discover Vendors" },
  { id: "Messages", label: "Messages" },
  { id: "Profile", label: "Profile" },
  { id: "Settings", label: "Settings" },
];

const EVENT_TYPES = [
  "Wedding",
  "Birthday",
  "Naming Ceremony",
  "Conference",
  "Book Launch",
  "Graduation",
  "Corporate Event",
];

const statusCards = [
  {
    title: "Waiting for Response",
    subtitle: "Awaiting vendor reply",
    value: 3,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    title: "Accepted",
    subtitle: "Confirmed bookings",
    value: 5,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Completed",
    subtitle: "Event concluded",
    value: 12,
    accent: "bg-sky-100 text-sky-700",
  },
];

const eventTypes = [
  "Wedding",
  "Birthday",
  "Naming Ceremony",
  "Conference",
  "Book Launch",
  "Graduation",
  "Corporate Event",
];

type VendorSection =
  | "Dashboard"
  | "Leads"
  | "Bookings"
  | "Messages"
  | "Availability"
  | "Profile"
  | "Payouts";

const vendorNavItems: VendorSection[] = [
  "Dashboard",
  "Leads",
  "Bookings",
  "Messages",
  "Availability",
  "Profile",
  "Payouts",
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

const vendorStatus = [
  {
    title: "New enquiries",
    subtitle: "Awaiting your response",
    value: 8,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    title: "Confirmed bookings",
    subtitle: "Upcoming events",
    value: 5,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Response rate",
    subtitle: "Last 30 days",
    value: "96%",
    accent: "bg-sky-100 text-sky-700",
  },
  {
    title: "Revenue",
    subtitle: "This month",
    value: "₦1.2m",
    accent: "bg-blue-100 text-blue-700",
  },
];

const vendorLeads = [
  {
    planner: "Tunde & Sade",
    event: "Wedding",
    date: "Jul 28",
    budget: "₦1,500,000",
    status: "New",
  },
  {
    planner: "Amina",
    event: "Corporate Launch",
    date: "Aug 03",
    budget: "₦850,000",
    status: "Pending",
  },
  {
    planner: "Emma",
    event: "Birthday Party",
    date: "Aug 10",
    budget: "₦420,000",
    status: "Confirmed",
  },
  {
    planner: "Chinasa",
    event: "Engagement",
    date: "Aug 18",
    budget: "₦650,000",
    status: "New",
  },
];

const vendorPerformance = [
  { label: "Mon", value: 68 },
  { label: "Tue", value: 82 },
  { label: "Wed", value: 74 },
  { label: "Thu", value: 90 },
  { label: "Fri", value: 96 },
  { label: "Sat", value: 84 },
  { label: "Sun", value: 72 },
];

const vendorBookings = [
  {
    client: "Eloise Events",
    service: "Full catering package",
    date: "Aug 12",
    total: "₦1,100,000",
    status: "Confirmed",
  },
  {
    client: "Bright Minds Co.",
    service: "Stage lighting setup",
    date: "Aug 21",
    total: "₦520,000",
    status: "Pending",
  },
  {
    client: "Nura & Co.",
    service: "Photography coverage",
    date: "Sep 05",
    total: "₦380,000",
    status: "Confirmed",
  },
];

const vendorMessages = [
  {
    from: "Amina",
    subject: "Menu preferences",
    preview: "Can you share the vegetarian options for 120 guests?",
    time: "1h ago",
  },
  {
    from: "Daniel",
    subject: "Venue dimensions",
    preview: "Please confirm the stage size and power requirements.",
    time: "4h ago",
  },
  {
    from: "Chinasa",
    subject: "Photo package update",
    preview: "I want to add drone coverage to my package.",
    time: "Yesterday",
  },
];

const vendorPayouts = [
  {
    period: "July 2026",
    amount: "₦860,000",
    status: "Paid",
  },
  {
    period: "June 2026",
    amount: "₦1,020,000",
    status: "Paid",
  },
  {
    period: "May 2026",
    amount: "₦730,000",
    status: "Processing",
  },
];

const plannerEnquiries = [
  {
    vendor: "Luminous Stage Co.",
    event: "Wedding Reception",
    date: "Jul 28",
    budget: "₦1,500,000",
    status: "Awaiting reply",
  },
  {
    vendor: "Aduke Décor & Events",
    event: "Corporate Gala",
    date: "Aug 03",
    budget: "₦950,000",
    status: "Quote requested",
  },
  {
    vendor: "Frame & Focus Photography",
    event: "Product Launch",
    date: "Aug 10",
    budget: "₦420,000",
    status: "Confirmed",
  },
];

const plannerNotifications = [
  {
    headline: "New message from Amaka's Kitchen",
    detail: "She sent a follow-up on your catering inquiry.",
    time: "2h ago",
  },
  {
    headline: "Booking confirmed",
    detail: "Rhythm Nation Band accepted your request for Aug 15.",
    time: "1d ago",
  },
  {
    headline: "Portfolio update",
    detail: "A vendor added 10 new photos to their listing.",
    time: "3d ago",
  },
];

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
  const [chatEnquiry, setChatEnquiry] = useState<Enquiry | null>(null);
  const [readChatIds, setReadChatIds] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser) {
      router.replace("/signin");
      return;
    }

    setUser(authUser);
    setIsLoading(false);
  }, [router]);

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

  useEffect(() => {
    if (user) {
      void loadEnquiries();
      void loadVendors();
      if (user.role.toUpperCase() === "VENDOR") {
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

        const enquiryRefresh = window.setInterval(() => {
          void loadEnquiries();
        }, 5_000);

        return () => window.clearInterval(enquiryRefresh);
      }
    }
  }, [user]);

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
    } catch (err: any) {
      setSaveError(String(err?.message ?? err));
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
    return null;
  }

  const role = user.role?.toUpperCase?.() ?? "";
  const isPlanner = role === "PLANNER";
  const isVendor = role === "VENDOR";
  const greetingName = user.firstName || user.email.split("@")[0];
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
        <Header
          user={{
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatar ?? undefined,
          }}
          onLogout={() => {
            clearAuth();
            router.replace("/");
          }}
          links={[]}
        />

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
          <div className="mx-auto grid max-w-[1700px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-6 rounded-[28px] bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                     <img
                       src={user.avatar}
                       alt={`${vendorName} profile`}
                       className="h-12 w-12 rounded-full object-cover"
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
            </aside>

            <section className="space-y-6">
              <header className="rounded-[32px] bg-white p-6 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-slate-500">Welcome back, {vendorName} 👋</p>
                  <div className="flex items-center gap-4">
                    <h1 className="mt-3 text-3xl font-semibold text-slate-950">{activeVendorSection}</h1>
                  </div>
                </div>
              </header>

              {activeVendorSection === "Dashboard" ? (
                <>
                  {pendingEnquiries.length > 0 ? <div role="status" className="rounded-[28px] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><span className="font-semibold">New booking request{pendingEnquiries.length === 1 ? "" : "s"} received.</span> Review {pendingEnquiries.length === 1 ? "it" : "them"} in Leads.</div> : null}
                  <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
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
                          <p className="text-sm font-semibold text-slate-500">Latest leads</p>
                          <h2 className="mt-1 text-2xl font-semibold text-slate-950">Recent planner enquiries</h2>
                        </div>
                        <button type="button" onClick={() => setActiveVendorSection("Leads")} className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
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
              ) : activeVendorSection === "Leads" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Open leads</p>
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
                          <img src={previewUrl} alt="avatar preview" className="mt-3 h-24 w-24 rounded-full object-cover" />
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
              ) : (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Payouts</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Payment history</h2>
                    </div>
                    <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Download report
                    </button>
                  </div>

                  <p className="mt-6 rounded-[28px] border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">Payout data will appear here when the backend payout endpoint is available.</p>
                </div>
              )}
            </section>
          </div>
        </main>

        <Footer />
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
      <Header
        user={{
          firstName: user.firstName,
          lastName: user.lastName,
          avatarUrl: user.avatar ?? undefined,
        }}
        onLogout={() => {
          clearAuth();
          router.replace("/");
        }}
        links={[]}
      />
      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-[1700px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 rounded-[28px] bg-slate-50 p-5">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.firstName ?? "User"} profile"`}
                  className="h-12 w-12 rounded-full object-cover"
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
                    return initials || "U";
                  })()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-slate-950">{user.firstName} {user.lastName}</p>
                <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Planner</p>
              </div>
            </div>
          </div>

          <nav className="space-y-1">
            {plannerNavItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id)}
                className={`w-full rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                  activeSection === item.id
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-10 rounded-[28px] bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-900">Need help?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Reach out to support for booking or vendor guidance.
            </p>
          </div>
 
        </aside>

        <section className="space-y-6">
          <header className="rounded-[32px] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">Good Morning, {greetingName} 👋</p>
                <h1 className="mt-3 text-3xl font-semibold text-slate-950">
                  {activeSection}
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  {activeSection === "Dashboard" && "Quickly manage your events, enquiries, and vendor matches."}
                  {activeSection === "Discover Vendors" && "Browse vendors by category, location, and rating."}
                  {activeSection === "Messages" && "View vendor enquiries and system messages in one place."}
                  {activeSection === "Profile" && "Manage your planner profile and account details."}
                  {activeSection === "Settings" && "Adjust your notification, privacy, and account preferences."}
                </p>
              </div>
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
            </div>
          </header>

          {activeSection === "Dashboard" ? (
            <>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <Search className="h-5 w-5 text-slate-500" />
                    <input
                      type="search"
                      placeholder="Search Wedding, Birthday, Conference..."
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    />
                  </div>

                  <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(180px,1fr))]">
                    {statusCards.map((card) => (
                      <div key={card.title} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                        <div className={`inline-flex rounded-2xl px-3 py-1 text-xs font-semibold ${card.accent}`}>
                          {card.value}
                        </div>
                        <p className="mt-5 text-sm font-semibold text-slate-950">{card.title}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-500">{card.subtitle}</p>
                      </div>
                    ))}
                  </div>

                   <div className="mt-8">
                     <div className="flex items-center justify-between">
                       <h2 className="text-xl font-semibold text-slate-950">What type of event are you planning?</h2>
                       <button type="button" className="text-sm font-semibold text-blue-600 hover:underline">
                         View all
                       </button>
                     </div>
                      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {(eventTypes.length ? eventTypes : EVENT_TYPES).map((type, index) => (
                          <button
                            key={type}
                            type="button"
                            className="group relative aspect-[4/3] overflow-hidden rounded-2xl"
                          >
                            <Image
                              src={getEventTypeImage(type, index)}
                              alt={type}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-4 text-white">
                              <p className="text-sm font-semibold">{type}</p>
                            </div>
                          </button>
                        ))}
                       {eventTypes.length === 0 ? <p className="text-sm text-slate-500 col-span-full">Your event types will appear after you send enquiries.</p> : null}
                     </div>
                   </div>
                </div>

                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Enquiry Status</p>
                      <p className="mt-1 text-base font-semibold text-slate-950">Review your active requests</p>
                    </div>
                    <button type="button" onClick={showAllEnquiries} className="text-sm font-semibold text-blue-600 hover:underline">
                      View all enquiries
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                    {statusCards.map((card) => (
                      <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{card.title}</p>
                            <p className="mt-1 text-sm text-slate-600">{card.subtitle}</p>
                          </div>
                          <div className={`rounded-3xl px-4 py-2 text-sm font-semibold ${card.accent}`}>
                            {card.value}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <section className="rounded-[32px] bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Recommended Vendors</p>
                    <h2 className="mt-1 text-xl font-semibold text-slate-950">Top picks for your event</h2>
                  </div>
                  <button type="button" className="text-sm font-semibold text-blue-600 hover:underline">
                    View all
                  </button>
                </div>
                <div className="mt-5 grid gap-3 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
                  {recommendedVendors.map((vendor) => (
                    <VendorCard
                      key={vendor.id}
                      vendor={vendor}
                      compact
                      onBook={(selectedVendor) => {
                        setBookingError(null);
                        setBookingNotice(null);
                        if (!user || user.role.toUpperCase() !== "PLANNER") {
                          setBookingError("Only planner accounts can send booking requests.");
                          return;
                        }
                        setBookingVendor(selectedVendor);
                      }}
                    />
                  ))}
                  {recommendedVendors.length === 0 ? <p className="text-sm text-slate-500">No vendor listings are available yet.</p> : null}
                </div>
                {bookingNotice ? <p role="status" className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800 shadow-lg">{bookingNotice}</p> : null}
              {bookingError ? <p role="alert" className="fixed bottom-5 right-5 z-50 max-w-sm rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm font-medium text-yellow-900 shadow-lg">{bookingError}</p> : null}
              </section>
            </>
          ) : activeSection === "Discover Vendors" ? (
            <div className="rounded-[32px] bg-white p-6 shadow-sm">
              <VendorDirectory />
            </div>
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
                  {!isLoadingEnquiries && plannerEnquiriesForUser.length === 0 ? <p className="text-sm text-slate-500">You have not sent any booking requests yet.</p> : null}
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
                  {plannerNotifications.map((notification, idx) => (
                    <div key={`${notification.headline}-${idx}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <p className="text-sm font-semibold text-slate-950">{notification.headline}</p>
                      <p className="mt-1 text-sm text-slate-600">{notification.detail}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{notification.time}</p>
                    </div>
                  ))}
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
                    <img src={previewUrl} alt="preview" className="h-20 w-20 rounded-full object-cover mt-2" />
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
      <Footer />
    </div>
  );
}
