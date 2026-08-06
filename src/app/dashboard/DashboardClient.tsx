"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuth, getAuthUser, saveAuthUser, type User, updateProfile, uploadProfileImage } from "@/lib/api";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { VendorCard } from "@/components/vendors/VendorCard";
import { VendorDirectory } from "@/components/vendors/VendorDirectory";
import { vendors } from "@/data/vendors";
import { Search } from "@/components/landing/icons";

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
  | "Profile"
  | "Portfolio"
  | "Payouts";

const vendorNavItems: VendorSection[] = [
  "Dashboard",
  "Bookings",
  "Messages",
  "Profile",
  "Portfolio",
  "Payouts",
];

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

const vendorPortfolio = [
  {
    title: "Elegant Wedding Decor",
    description: "Marble centerpieces and custom lighting for a 200 person wedding.",
  },
  {
    title: "Corporate Gala Set",
    description: "Stage design and AV support for a multinational launch event.",
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
  const [profileForm, setProfileForm] = useState({ firstName: "", lastName: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      let avatarUrl = user.avatar ?? null;
      if (selectedFile) {
        const upload = await uploadProfileImage(selectedFile);
        if (upload.error || !upload.data) {
          setSaveError(upload.error ?? "Image upload failed");
          setIsSaving(false);
          return;
        }
        avatarUrl = upload.data.avatar;
      }

      const payload: Partial<User> = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        avatar: avatarUrl ?? undefined,
      };

      const res = await updateProfile(payload);
      if (res.error || !res.data) {
        setSaveError(res.error ?? "Update failed");
        setIsSaving(false);
        return;
      }

      const updatedUser = { ...(user as User), ...(res.data as User) };
      saveAuthUser(updatedUser);
      setUser(updatedUser);
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
  const recommendedVendors = vendors.slice(0, 4);

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
                        <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                          View all
                        </button>
                      </div>

                      <div className="mt-6 space-y-4">
                        {vendorLeads.map((lead) => (
                          <div key={`${lead.planner}-${lead.date}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-slate-950">{lead.planner}</p>
                                <p className="text-sm text-slate-600">{lead.event} • {lead.date}</p>
                              </div>
                              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                <span>{lead.budget}</span>
                                <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">
                                  {lead.status}
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
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            +12% vs last week
                          </span>
                        </div>

                        <div className="mt-6 flex items-end gap-3 px-1">
                          {vendorPerformance.map((point) => (
                            <div key={point.label} className="flex-1 text-center">
                              <div className="mx-auto h-24 w-full rounded-3xl bg-slate-100" style={{ height: `${point.value / 1.2}px` }}>
                                <div className="h-full rounded-3xl bg-gradient-to-b from-blue-600 to-sky-500" />
                              </div>
                              <p className="mt-2 text-xs font-semibold text-slate-500">{point.label}</p>
                            </div>
                          ))}
                        </div>

                        <div className="mt-5 rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                          3 new planner messages this week. Keep your response rate high to convert more leads.
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
                    <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Refresh list
                    </button>
                  </div>

                  <div className="mt-6 space-y-4">
                    {vendorLeads.map((lead) => (
                      <div key={`${lead.planner}-${lead.date}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{lead.planner}</p>
                            <p className="mt-1 text-sm text-slate-600">{lead.event} • {lead.date}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                            <span>{lead.budget}</span>
                            <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{lead.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                      <div key={`${booking.client}-${booking.date}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{booking.client}</p>
                            <p className="mt-1 text-sm text-slate-600">{booking.service}</p>
                          </div>
                          <div className="text-sm text-slate-500 sm:text-right">
                            <p>{booking.date}</p>
                            <p className="mt-1 font-semibold text-slate-900">{booking.total}</p>
                            <span className="mt-1 inline-flex rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{booking.status}</span>
                          </div>
                        </div>
                      </div>
                    ))}
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
                    {vendorMessages.map((message, idx) => (
                      <div key={`${message.from}-${idx}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{message.from}</p>
                            <p className="mt-1 text-sm text-slate-600">{message.subject}</p>
                            <p className="mt-2 text-sm text-slate-500">{message.preview}</p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{message.time}</p>
                        </div>
                      </div>
                    ))}
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
              ) : activeVendorSection === "Portfolio" ? (
                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Portfolio</p>
                      <h2 className="mt-1 text-2xl font-semibold text-slate-950">Showcase your work</h2>
                    </div>
                    <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                      Add new item
                    </button>
                  </div>

                  <div className="mt-6 grid gap-4">
                    {vendorPortfolio.map((item) => (
                      <div key={item.title} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <p className="text-sm font-semibold text-slate-950">{item.title}</p>
                        <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                      </div>
                    ))}
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

                  <div className="mt-6 space-y-4">
                    {vendorPayouts.map((payout) => (
                      <div key={payout.period} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950">{payout.period}</p>
                            <p className="mt-1 text-sm text-slate-600">{payout.status}</p>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">{payout.amount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>
    );
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
                    <div className="mt-4 flex flex-wrap gap-3">
                      {eventTypes.map((type) => (
                        <button
                          key={type}
                          type="button"
                          className="rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">Enquiry Status</p>
                      <p className="mt-1 text-base font-semibold text-slate-950">Review your active requests</p>
                    </div>
                    <button type="button" className="text-sm font-semibold text-blue-600 hover:underline">
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
                    <VendorCard key={vendor.id} vendor={vendor} compact />
                  ))}
                </div>
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
                  <button type="button" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                    View all
                  </button>
                </div>
                <div className="mt-6 space-y-4">
                  {plannerEnquiries.map((item) => (
                    <div key={`${item.vendor}-${item.date}`} className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{item.vendor}</p>
                          <p className="mt-1 text-sm text-slate-600">{item.event} • {item.date}</p>
                        </div>
                        <div className="flex flex-col items-start gap-2 text-sm text-slate-500 sm:items-end">
                          <span>{item.budget}</span>
                          <span className="rounded-full bg-white px-3 py-1 text-slate-700 shadow-sm">{item.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
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
      <Footer />
    </div>
  );
}
