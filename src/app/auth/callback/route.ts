import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/actions/auth-actions";
import { getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    await supabase?.auth.exchangeCodeForSession(code);
    await ensureProfile();
    const onboarding = await getStudentOnboardingProfile().catch(() => null);
    if (!onboarding?.onboardingCompleted && next === "/") {
      return NextResponse.redirect(`${origin}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
