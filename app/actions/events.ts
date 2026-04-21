"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import type { CreateEventInput, UserItem } from "@/lib/api";

export async function createEvent(data: CreateEventInput): Promise<{ id: number }> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const { event } = await api.events.create(data, raw.value);
  return { id: event.id };
}

export async function searchUsers(q: string): Promise<UserItem[]> {
  if (q.length < 2) return [];
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const { users } = await api.users.search(q, raw.value);
  return users;
}

export async function bulkAddParticipants(eventId: number, userIds: number[]): Promise<void> {
  if (userIds.length === 0) return;
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  await api.participants.bulkCreate(eventId, userIds, raw.value);
}
