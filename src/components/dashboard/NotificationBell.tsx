"use client";

import { useEffect, useRef, useState } from "react";
import { Bell } from "@/components/landing/icons";
import { formatDate } from "@/lib/formatDate";
import { type Enquiry } from "@/lib/api";

export type NotificationItem = {
  id: string;
  headline: string;
  detail: string;
  time: string;
  unread: boolean;
  onClick: () => void;
};

export type NotificationBellProps = {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkAllRead?: () => void;
  label?: string;
};

export function NotificationBell({
  notifications,
  unreadCount,
  onMarkAllRead,
  label = "Notifications",
}: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        open &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        panelRef.current &&
        !panelRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
    }, [open]);

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-full border border-slate-200 bg-slate-50 p-2.5 text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-2"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          className="absolute right-0 mt-2 w-80 origin-top-right rounded-[28px] border border-slate-200 bg-white shadow-xl ring-1 ring-black/5 focus:outline-none z-50"
        >
          <div className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
              {onMarkAllRead && unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    onMarkAllRead();
                    setOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              ) : null}
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                <p>No new notifications.</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    notification.onClick();
                    setOpen(false);
                  }}
                  className={`w-full text-left transition-colors ${
                    notification.unread
                      ? "bg-blue-50/40"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <div className="border-t border-slate-100 px-4 py-3 first:border-t-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${
                          notification.unread
                            ? "bg-blue-600"
                            : "bg-slate-300"
                        }`}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-950">
                          {notification.headline}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-600 line-clamp-1">
                          {notification.detail}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {formatDate(notification.time, { relative: true })}
                        </p>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
    );
}

export function enquiriesToNotifications(
  enquiries: Enquiry[],
  options: {
    onSelect: (enquiry: Enquiry) => void;
  },
): NotificationItem[] {
  return enquiries.map((enquiry) => ({
    id: enquiry.id,
    headline: `${enquiry.eventType} — ${enquiry.planner?.name || enquiry.planner?.firstName || enquiry.planner?.email || "Planner"}`,
    detail: `${enquiry.eventType} on ${formatDate(enquiry.eventDate)}`,
    time: enquiry.createdAt || "",
    unread: (enquiry.status ?? "").toUpperCase() === "NEW",
    onClick: () => options.onSelect(enquiry),
  }));
}



