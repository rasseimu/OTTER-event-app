import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import RecipesClient from "./RecipesClient";

export default async function RecipesPage() {
  const cookieStore = await cookies();
  const raw = cookieStore.get("token");
  if (!raw) redirect("/login");
  const token = raw.value;

  const { recipes } = await api.recipes.list(undefined, token);

  return <RecipesClient recipes={recipes} />;
}
