import type { Metadata } from "next";
import { Suspense } from "react";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — EventConnect",
  description: "Your EventConnect dashboard.",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-100 px-6 py-16 text-center"><div className="rounded-3xl border border-slate-200 bg-white px-8 py-10 shadow-sm"><p className="text-lg font-medium text-slate-700">Loading dashboard…</p></div></div>}>
      <DashboardClient />
    </Suspense>
  );
}
