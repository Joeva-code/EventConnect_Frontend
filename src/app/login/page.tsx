import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In — EventConnect",
  description: "Sign in to your EventConnect account.",
};

export default function LoginPage() {
  redirect("/signin");
}
