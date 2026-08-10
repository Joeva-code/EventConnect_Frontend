import type { Metadata } from "next";
import { notFound } from "next/navigation";
import EventWorkspaceClient from "./EventWorkspaceClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  await params;
  return {
    title: `Event Workspace — EventConnect`,
    description: "Manage your event with Maxify Tickets integration.",
  };
}

export default async function EventWorkspacePage({ params }: PageProps) {
  const { id } = await params;
  
  // Basic validation - actual data loading happens client-side
  if (!id) {
    notFound();
  }

  return <EventWorkspaceClient eventId={id} />;
}
