import { createClient, getAuthenticatedUser } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  fullName: string;
  role: string;
};

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

function displayNameFromUser(metadataName: unknown, profileName?: string | null, email?: string) {
  if (typeof metadataName === "string" && metadataName.trim()) {
    return metadataName.trim();
  }

  if (profileName?.trim()) {
    return profileName.trim();
  }

  return email ?? "Student";
}
