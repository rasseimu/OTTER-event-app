import { cookies } from "next/headers";
import { api, type EventItem } from "@/lib/api";
import HomeClient from "./HomeClient";

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";

  let upcomingEvents: EventItem[] = [];
  let pastEvents: EventItem[] = [];

  try {
    const [upcomingData, pastData] = await Promise.all([
      api.events.list("upcoming", token),
      api.events.list("past", token),
    ]);
    upcomingEvents = upcomingData.events;
    pastEvents = pastData.events;
  } catch {
    // API not running during build — render empty state
  }

  return (
    <HomeClient
      upcomingEvents={upcomingEvents}
      pastEvents={pastEvents}
    />
  );
}
