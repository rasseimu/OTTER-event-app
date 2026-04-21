import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const token = raw.value;

  const [eventData, participantsData] = await Promise.all([
    api.events.get(Number(id), token),
    api.participants.list(Number(id), token),
  ]);

  return (
    <EventDetailClient
      event={eventData.event}
      participants={participantsData.participants}
    />
  );
}
