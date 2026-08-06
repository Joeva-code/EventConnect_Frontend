import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { MobileBrand } from "@/components/auth/MobileBrand";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { forgotPasswordContent } from "@/data/forgotPassword";

export const metadata: Metadata = {
  title: forgotPasswordContent.meta.title,
  description: forgotPasswordContent.meta.description,
};

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <MobileBrand />
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        {forgotPasswordContent.heading}
      </h1>
      <p className="mt-2 text-slate-500">{forgotPasswordContent.subheading}</p>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
