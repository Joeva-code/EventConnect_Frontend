import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { MobileBrand } from "@/components/auth/MobileBrand";
import { Check } from "@/components/landing/icons";
import { welcomeContent } from "@/data/welcome";

export const metadata: Metadata = {
  title: welcomeContent.meta.title,
  description: welcomeContent.meta.description,
};

export default function WelcomePage() {
  return (
    <AuthLayout>
      <MobileBrand />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
        <Check className="h-6 w-6" />
      </div>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
        {welcomeContent.heading}
      </h1>
      <p className="mt-2 text-slate-500">{welcomeContent.subheading}</p>

      <div className="mt-8 space-y-3">
        <Link
          href="/"
          className="block w-full rounded-xl bg-blue-600 py-3.5 text-center text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700"
        >
          {welcomeContent.exploreCta}
        </Link>
        <Link
          href="/signin"
          className="block w-full rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          {welcomeContent.signOut}
        </Link>
      </div>
    </AuthLayout>
  );
}
