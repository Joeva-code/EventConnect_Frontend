import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import EventsClient from "./EventsClient";

export const metadata: Metadata = {
  title: "My Events — EventConnect",
  description: "Manage your events with Maxify Tickets integration.",
};

export default function EventsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-10 sm:py-16">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                My Events
              </h1>
              <p className="mt-3 max-w-2xl text-lg text-slate-500">
                Create and manage your events. Launch with Maxify Tickets for seamless attendee management.
              </p>
            </div>
          </div>
          <div className="mt-10">
            <EventsClient />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
