"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStudentOnboardingProfile } from "@/lib/repositories/onboarding";

export async function signInWithPasswordAction(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20is%20not%20configured");
  }

  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  await ensureProfile();
  await redirectAfterAuth();
}

export async function redirectAfterAuth() {
  const onboarding = await getStudentOnboardingProfile().catch(() => null);
  redirect(onboarding?.onboardingCompleted ? "/" : "/onboarding");
}

export async function signUpWithPasswordAction(formData: FormData) {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20is%20not%20configured");
  }

  const email = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const fullName = formData.get("fullName")?.toString() || "Student";

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/login?message=Check%20your%20email%20or%20sign%20in%20if%20email%20confirmation%20is%20disabled");
}

export async function signInWithGoogleAction() {
  const supabase = await createClient();

  if (!supabase) {
    redirect("/login?error=Supabase%20is%20not%20configured");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeURIComponent(error?.message ?? "Could not start Google login")}`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect("/login");
}

export async function ensureProfile() {
  const supabase = await createClient();
  if (!supabase) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const fullName =
    typeof user.user_metadata.full_name === "string" && user.user_metadata.full_name
      ? user.user_metadata.full_name
      : "Student";

  await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: fullName,
      role: "student",
    },
    { onConflict: "id" },
  );
}
