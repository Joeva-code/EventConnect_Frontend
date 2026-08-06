import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { MobileBrand } from "@/components/auth/MobileBrand";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account — EventConnect",
  description: "Create your EventConnect account.",
};

export default function SignUpPage() {
  return (
    <AuthLayout>
      <MobileBrand />
      <h1 className="text-3xl font-bold tracking-tight text-slate-950">
        Create Account
      </h1>
      <p className="mt-2 text-slate-500">Create your EventConnect account</p>
      <SignUpForm />
    </AuthLayout>
  );
}
