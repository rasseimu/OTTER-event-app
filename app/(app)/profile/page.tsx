import { cookies as getCookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import ProfileClient from "./ProfileClient";

async function logout() {
  "use server";
  const cookieStore = await getCookies();
  cookieStore.delete("token");
  redirect("/login");
}

export default async function ProfilePage() {
  const cookieStore = await getCookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const token = raw.value;

  const { user } = await api.users.me(token);

  return <ProfileClient user={user} logout={logout} />;
}
