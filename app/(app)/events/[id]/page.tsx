import { cookies } from "next/headers";
import { api } from "@/lib/api";
import EventDetailClient from "./EventDetailClient";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")!.value;

  const [eventData, participantsData] = await Promise.all([
    api.events.get(Number(id), token),
    api.participants.list(Number(id), token),
  ]);

  return (
    <EventDetailClient
      event={eventData.event}
      participants={participantsData.participants}
      token={token}
    />
  );
}
