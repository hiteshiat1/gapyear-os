import { getAuthenticatedUser, createClient } from "@/lib/supabase/server";

export async function getSupabaseForRead() {
  return createClient();
}

export async function requireUser() {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("You must be signed in to save changes.");
  }

  return user;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}
