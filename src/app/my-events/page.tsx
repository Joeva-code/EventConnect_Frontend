import type { Metadata } from "next";
import MyEventsClient from "./MyEventsClient";

export const metadata: Metadata = {
  title: "My Events — EventConnect",
  description: "Manage and monitor all your events.",
};

export default function MyEventsPage() {
  return <MyEventsClient />;
}
