import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import DiscoverClient from "./DiscoverClient";

export default async function DiscoverPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const token = raw.value;

  const [rankingsData, challengesData] = await Promise.all([
    api.discover.rankings(token),
    api.discover.challenges(token),
  ]);

  return (
    <DiscoverClient
      rankings={rankingsData.rankings}
      challenges={challengesData.challenges}
    />
  );
}
