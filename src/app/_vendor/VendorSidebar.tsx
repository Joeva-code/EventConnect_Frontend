"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Message,
  Clock,
  User as UserIcon,
  BadgeCheck,
  LogOut,
} from "@/components/landing/icons";
import { Logo } from "@/components/branding/Logo";

export type VendorSection =
  | "Dashboard"
  | "Bookings"
  | "Messages"
  | "Availability"
  | "Profile"
  | "Portfolio";

type VendorNavItem = {
  id: VendorSection;
  label: string;
  icon: React.ReactNode;
  href: string;
};

const vendorNavItems: VendorNavItem[] = [
  { id: "Dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/dashboard?vendor=Dashboard" },
  { id: "Bookings", label: "Bookings", icon: <Calendar className="h-4 w-4" />, href: "/dashboard?vendor=Bookings" },
  { id: "Messages", label: "Messages", icon: <Message className="h-4 w-4" />, href: "/dashboard?vendor=Messages" },
  { id: "Availability", label: "Availability", icon: <Clock className="h-4 w-4" />, href: "/dashboard?vendor=Availability" },
  { id: "Profile", label: "Profile", icon: <UserIcon className="h-4 w-4" />, href: "/dashboard?vendor=Profile" },
  { id: "Portfolio", label: "Portfolio", icon: <BadgeCheck className="h-4 w-4" />, href: "/dashboard?vendor=Portfolio" },
];

export type VendorSidebarProps = {
  activeSection: VendorSection;
  onSectionChange: (section: VendorSection) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  onLogout?: () => void;
};

export function VendorSidebar({
  activeSection,
  onSectionChange,
  open,
  onOpenChange,
  onClose,
  onLogout,
}: VendorSidebarProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
  };
  const isActive = (item: VendorNavItem) => item.id === activeSection;

  return (
    <>
      <aside
        className={`rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm xl:sticky xl:top-0 xl:h-screen xl:overflow-y-auto xl:relative xl:block xl:translate-x-0 fixed inset-y-0 left-0 z-50 w-[280px] -translate-x-full overflow-y-auto transition-transform duration-200 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-6 flex items-center justify-between xl:hidden">
          <p className="text-sm font-semibold text-slate-950">Menu</p>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2.5 text-slate-500 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-6">
          <Logo iconOnly size="lg" className="text-lg" />
        </div>

        <nav className="space-y-1" aria-label="Vendor navigation">
          {vendorNavItems.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setIsOpen(false)}
                className={`flex w-full items-center gap-3 rounded-3xl px-4 py-3 text-left text-sm font-semibold transition ${
                  active
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="flex h-5 w-5 items-center justify-center">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-4 border-t border-slate-200" />

        {onLogout ? (
          <button
            type="button"
            onClick={onLogout}
            className="mt-6 flex w-full items-center gap-3 rounded-3xl border border-rose-200 bg-white px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            Log out
          </button>
        ) : null}
      </aside>

      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 xl:hidden"
          onClick={() => setIsOpen(false)}
        />
      ) : null}
    </>
  );
}

export function VendorMobileHeader({
  onMenuClick,
}: { onMenuClick: () => void }) {
  return (
    <div className="xl:hidden mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
      <button
        type="button"
        onClick={onMenuClick}
        className="flex items-center gap-2 text-slate-700"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
        <span>Menu</span>
      </button>
    </div>
  );
}

