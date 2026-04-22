import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, type EventItem } from "@/lib/api";
import HomeClient from "./(app)/HomeClient";
import BottomNav from "@/components/BottomNav";

export default async function RootPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value ?? "";
  if (!token) redirect("/login");

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
    // API unavailable — render empty state
  }

  return (
    <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: "#F5F5F5", paddingBottom: 60, position: "relative" }}>
      <HomeClient upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
      <BottomNav />
    </div>
  );
}
