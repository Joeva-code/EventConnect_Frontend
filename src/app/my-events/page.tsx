import type { Metadata } from "next";
import { Suspense } from "react";
import MyEventsClient from "./MyEventsClient";

export const metadata: Metadata = {
  title: "My Events — EventConnect",
  description: "Manage and monitor all your events.",
};

export default function MyEventsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-2xl p-10 text-center text-sm text-slate-500">Loading…</div>}>
      <MyEventsClient />
    </Suspense>
  );
}
