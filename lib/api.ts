// lib/api.ts
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function buildHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...rest } = options;
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: buildHeaders(token),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  events: {
    list: (filter: "upcoming" | "past", token: string) =>
      apiFetch<{ events: EventItem[] }>(`/events?filter=${filter}`, { token }),
    get: (id: number, token: string) =>
      apiFetch<{ event: EventItem }>(`/events/${id}`, { token }),
    create: (data: CreateEventInput, token: string) =>
      apiFetch<{ event: EventItem }>("/events", {
        method: "POST",
        body: JSON.stringify({ event: data }),
        token,
      }),
    update: (id: number, data: Partial<CreateEventInput>, token: string) =>
      apiFetch<{ event: EventItem }>(`/events/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ event: data }),
        token,
      }),
    delete: (id: number, token: string) =>
      apiFetch<void>(`/events/${id}`, { method: "DELETE", token }),
  },

  participants: {
    list: (eventId: number, token: string) =>
      apiFetch<{ participants: UserItem[] }>(`/events/${eventId}/participants`, { token }),
    add: (eventId: number, userId: number, token: string) =>
      apiFetch<unknown>(`/events/${eventId}/participants`, {
        method: "POST",
        body: JSON.stringify({ user_id: userId }),
        token,
      }),
  },

  expenses: {
    list: (eventId: number, token: string) =>
      apiFetch<{ expenses: ExpenseItem[] }>(`/events/${eventId}/expenses`, { token }),
    create: (eventId: number, data: { amount: number; description?: string }, token: string) =>
      apiFetch<{ expense: ExpenseItem }>(`/events/${eventId}/expenses`, {
        method: "POST",
        body: JSON.stringify({ expense: data }),
        token,
      }),
    update: (eventId: number, expenseId: number, data: { amount?: number; description?: string }, token: string) =>
      apiFetch<{ expense: ExpenseItem }>(`/events/${eventId}/expenses/${expenseId}`, {
        method: "PATCH",
        body: JSON.stringify({ expense: data }),
        token,
      }),
  },

  ingredients: {
    list: (eventId: number, token: string) =>
      apiFetch<{ ingredients: IngredientItem[] }>(`/events/${eventId}/ingredients`, { token }),
    create: (eventId: number, data: { name: string; quantity?: string }, token: string) =>
      apiFetch<{ ingredient: IngredientItem }>(`/events/${eventId}/ingredients`, {
        method: "POST",
        body: JSON.stringify({ ingredient: data }),
        token,
      }),
    update: (eventId: number, id: number, data: { checked?: boolean; name?: string }, token: string) =>
      apiFetch<{ ingredient: IngredientItem }>(`/events/${eventId}/ingredients/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ ingredient: data }),
        token,
      }),
  },

  photos: {
    list: (eventId: number, token: string) =>
      apiFetch<{ photos: PhotoItem[] }>(`/events/${eventId}/photos`, { token }),
    create: (eventId: number, data: { image_url: string; comment?: string }, token: string) =>
      apiFetch<{ photo: PhotoItem }>(`/events/${eventId}/photos`, {
        method: "POST",
        body: JSON.stringify({ photo: data }),
        token,
      }),
  },

  ratings: {
    list: (eventId: number, token: string) =>
      apiFetch<{ ratings: RatingItem[]; averages: RatingAverages }>(`/events/${eventId}/ratings`, { token }),
    create: (eventId: number, data: RatingInput, token: string) =>
      apiFetch<{ rating: RatingItem }>(`/events/${eventId}/ratings`, {
        method: "POST",
        body: JSON.stringify({ rating: data }),
        token,
      }),
  },

  recipes: {
    list: (eventType: string | undefined, token: string) =>
      apiFetch<{ recipes: RecipeItem[] }>(
        `/recipes${eventType ? `?event_type=${eventType}` : ""}`,
        { token }
      ),
    get: (id: number, token: string) =>
      apiFetch<{ recipe: RecipeItem }>(`/recipes/${id}`, { token }),
  },

  users: {
    me: (token: string) =>
      apiFetch<{ user: UserProfile }>("/users/me", { token }),
    updateMe: (data: { name?: string; avatar_url?: string }, token: string) =>
      apiFetch<{ user: UserProfile }>("/users/me", {
        method: "PATCH",
        body: JSON.stringify({ user: data }),
        token,
      }),
  },

  discover: {
    rankings:   (token: string) => apiFetch<{ rankings: Ranking[] }>("/discover/rankings",   { token }),
    challenges: (token: string) => apiFetch<{ challenges: Challenge[] }>("/discover/challenges", { token }),
    contest:    (token: string) => apiFetch<{ contest: Contest }>("/discover/contest",       { token }),
  },
};

// ─── Shared types ────────────────────────────────────────────────────────────

export interface UserItem {
  id: number;
  name: string;
  avatar_url: string | null;
}

export interface UserProfile extends UserItem {
  email: string;
  stats: {
    events_participated: number;
    events_organized: number;
    average_rating: number;
  };
}

export interface EventItem {
  id: number;
  name: string;
  event_type: "drinking" | "bbq" | "cooking" | "other";
  date: string;
  time: string;
  location: string | null;
  organizer: UserItem;
  participant_count: number;
  created_at: string;
}

export interface CreateEventInput {
  name: string;
  event_type: "drinking" | "bbq" | "cooking" | "other";
  date: string;
  time?: string;
  location?: string;
}

export interface ExpenseItem {
  id: number;
  amount: number;
  description: string | null;
  payer: UserItem;
}

export interface IngredientItem {
  id: number;
  name: string;
  quantity: string | null;
  checked: boolean;
  assignee: UserItem | null;
}

export interface PhotoItem {
  id: number;
  image_url: string;
  comment: string | null;
  uploader: UserItem;
}

export interface RatingItem {
  id: number;
  taste: number;
  fun: number;
  value: number;
  repeat: number;
  user: UserItem;
}

export interface RatingAverages {
  taste: number;
  fun: number;
  value: number;
  repeat: number;
}

export interface RatingInput {
  taste: number;
  fun: number;
  value: number;
  repeat: number;
}

export interface RecipeItem {
  id: number;
  name: string;
  event_type: "drinking" | "bbq" | "cooking" | "other";
  cook_time_minutes: number | null;
  serves: number | null;
  difficulty: "easy" | "medium" | "hard";
  image_url: string | null;
}

export interface Ranking {
  rank: number;
  user: UserItem;
  avg_rating: number;
  rating_count: number;
}

export interface Challenge {
  id: number;
  name: string;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  badge: string;
}

export interface Contest {
  title: string;
  photos: Array<PhotoItem & { uploader: UserItem }>;
}
