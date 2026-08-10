import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { MobileBrand } from "@/components/auth/MobileBrand";
import { SignInForm } from "@/components/auth/SignInForm";
import { signInContent } from "@/data/signin";

export const metadata: Metadata = {
  title: signInContent.meta.title,
  description: signInContent.meta.description,
};

export default function SignInPage() {
  return (
    <AuthLayout>
      <MobileBrand />
      <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
        {signInContent.heading}
      </h1>
      <p className="mt-2 text-slate-500">{signInContent.subheading}</p>
      <SignInForm />
    </AuthLayout>
  );
}