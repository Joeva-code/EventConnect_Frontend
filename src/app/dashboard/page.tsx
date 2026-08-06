import type { Metadata } from "next";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — EventConnect",
  description: "Your EventConnect dashboard.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
