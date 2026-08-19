import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";
import { requireUser } from "./common";

export type CurrentProfile = {
  id: string;
  fullName: string;
  role: string;
};

export type AdminProfileRow = {
  id: string;
  fullName: string;
  role: string;
  createdAt: string;
};

const ASSIGNABLE_ROLES = ["student", "parent", "tutor", "mentor", "admin"] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const user = await getAuthenticatedUser();

  if (!supabase || !user) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getCurrentProfile failed", error.message);
  }

  return {
    id: user.id,
    fullName: displayNameFromUser(user.user_metadata.full_name, data?.full_name, user.email),
    role: data?.role ?? "student",
  };
}

export function firstName(profile: CurrentProfile | null) {
  return profile?.fullName.split(" ").filter(Boolean)[0] ?? "Student";
}

export async function isCurrentUserAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

export async function listAllProfiles(): Promise<AdminProfileRow[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id,full_name,role,created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("listAllProfiles failed", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    role: row.role,
    createdAt: row.created_at,
  }));
}

export async function updateUserRole(targetUserId: string, role: AssignableRole) {
  const supabase = await createClient();
  const admin = await requireUser();

  if (!supabase) throw new Error("Supabase is not configured.");
  if (!ASSIGNABLE_ROLES.includes(role)) throw new Error("Invalid role.");

  const requester = await getCurrentProfile();
  if (requester?.role !== "admin") {
    throw new Error("Only admins can change user roles.");
  }

  if (targetUserId === admin.id && role !== "admin") {
    throw new Error("You cannot remove your own admin role.");
  }

  const { error } = await supabase.from("profiles").update({ role }).eq("id", targetUserId);
  if (error) throw new Error(error.message);
}

function displayNameFromUser(metadataName: unknown, profileName?: string | null, email?: string) {
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  if (profileName?.trim()) {
    return profileName.trim();
  }

  return email ?? "Student";
}
