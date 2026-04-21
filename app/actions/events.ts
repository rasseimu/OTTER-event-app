"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import type { CreateEventInput } from "@/lib/api";

export async function createEvent(data: CreateEventInput): Promise<{ id: number }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const { event } = await api.events.create(data, raw.value);
  return { id: event.id };
}
