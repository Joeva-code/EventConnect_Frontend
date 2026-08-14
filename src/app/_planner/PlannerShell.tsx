"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Calendar, Message, Search, LayoutDashboard, LogOut, User as UserIcon, Ticket } from "@/components/landing/icons";
import { Logo } from "@/components/branding/Logo";

export type PlannerSection =
  | "Dashboard"
  | "My Events"
  | "MaxifyTickets"
  | "Discover Vendors"
  | "Messages"
  | "Profile";

export type PlannerNavItem = {
  id: PlannerSection;
  label: string;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  imageClassName?: string;
  href?: string;
};

export const plannerNavItems: PlannerNavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard" },
  { id: "My Events", label: "My Events", icon: <Calendar className="h-4 w-4" />, href: "/my-events" },
   { id: "MaxifyTickets", label: "MaxifyTickets", icon: <Ticket className="h-4 w-4" />, href: "/dashboard#maxify-tickets", image: (
    <Image
      src="/image.png"
      alt="Maxify Tickets"
      width={160}
      height={48}
      className="h-12 w-auto object-contain"
    />
  ), imageClassName: "hover:bg-transparent" },
  { id: "Discover Vendors", label: "Find Vendors", icon: <Search className="h-4 w-4" />, href: "/dashboard#discover-vendors" },
  { id: "Messages", label: "Messages", icon: <Message className="h-4 w-4" />, href: "/dashboard#messages" },
  { id: "Profile", label: "Profile", icon: <UserIcon className="h-4 w-4" />, href: "/dashboard#profile" },
];

export type PlannerShellProps = {
  activeSection: PlannerSection;
  setActiveSection: (section: PlannerSection) => void;
  children: React.ReactNode;
};

export function PlannerShell({
  activeSection,
  setActiveSection,
  children,
}: PlannerShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hash, setHash] = useState<string>("");

  // Keep the hash in sync so active highlighting tracks the current route even
  // after navigation / direct URL access (e.g. /dashboard#messages).
  useEffect(() => {
    setHash(typeof window !== "undefined" ? window.location.hash.slice(1) : "");
  }, [pathname]);

  // Derive the active item from the current route instead of relying on the
  // manually-passed section state, which can drift after navigation.
  const derivedActive: PlannerSection =
    plannerNavItems.find((item) => {
      if (!item.href) return item.id === activeSection;
      const [path, frag] = item.href.split("#");
      if (path !== pathname) return false;
      if (!frag) return true;
      return hash === frag;
    })?.id ?? activeSection;

  const handleNavClick = (item: PlannerNavItem) => {
    if (item.href) {
      router.push(item.href);
    } else {
      setActiveSection(item.id);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("eventconnect_token");
      window.localStorage.removeItem("eventconnect_user");
      window.sessionStorage.removeItem("eventconnect_token");
      window.sessionStorage.removeItem("eventconnect_user");
    }
    router.replace("/");
  };

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

          <aside className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:relative xl:block xl:translate-x-0 fixed inset-y-0 left-0 z-50 w-[280px] overflow-y-auto transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
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
                const isActive = derivedActive === item.id;

                return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => handleNavClick(item)}
                      className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? item.id === "MaxifyTickets"
                            ? "bg-white text-slate-950 shadow"
                            : "bg-blue-600 text-white shadow"
                          : item.imageClassName ?? "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {item.icon && <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>}
                      {item.image ? (
                        <span className="flex-1">{item.image}</span>
                      ) : (
                        <span className="flex-1">{item.label}</span>
                      )}
                  </button>
                );
              })}
            </nav>

            <div className="my-4 border-t border-slate-200" />

            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 flex w-full items-center gap-3 rounded-3xl border border-rose-200 bg-white px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              <LogOut className="h-4 w-4 text-rose-500" />
              Log out
            </button>
          </aside>

          <section className="space-y-6">
             {children}
          </section>
        </div>
      </main>
    </div>
  );
}

