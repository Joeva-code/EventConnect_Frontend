import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { VendorDirectory } from "@/components/vendors/VendorDirectory";

export const metadata: Metadata = {
  title: "Find Vendors — EventConnect",
  description:
    "Browse verified event vendors on EventConnect — decoration, catering, venues, music, photography, and more.",
};

export default function VendorsPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight text-slate-950">
            Find Vendors
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-500">
            Browse verified vendors across every category and find the right
            fit for your event.
          </p>

          <div className="mt-10">
            <VendorDirectory />
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
