import { signOutAction } from "@/actions/auth-actions";
import { updateProfileSettingsAction } from "@/actions/profile-actions";
import { AppShell } from "@/components/app-shell";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import { getCurrentProfile } from "@/lib/repositories/profiles";

export default async function ProfileSettingsPage() {
  const [profile, studentProfile] = await Promise.all([
    getCurrentProfile(),
    getStudentOnboardingProfile().catch(() => null),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Profile"
        description="Manage account display details, visual tone, and sign out."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Card>
          <h2 className="text-lg font-semibold">Profile Management</h2>
          <form action={updateProfileSettingsAction} className="mt-4 space-y-5">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                name="firstName"
                placeholder="First name"
                defaultValue={studentProfile?.firstName ?? profile?.fullName.split(" ")[0] ?? ""}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                name="schoolCollege"
                placeholder="School / college"
                defaultValue={studentProfile?.schoolCollege ?? ""}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-slate-700">Visual tone</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <input
                    name="visualTone"
                    type="radio"
                    value="masculine"
                    defaultChecked={(studentProfile?.visualTone ?? "masculine") === "masculine"}
                  />
                  <span>
                    <span className="block font-medium">Masculine</span>
                    <span className="mt-1 flex gap-2">
                      <span className="h-5 w-10 rounded bg-slate-950" />
                      <span className="h-5 w-10 rounded bg-slate-100" />
                    </span>
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <input
                    name="visualTone"
                    type="radio"
                    value="feminine"
                    defaultChecked={studentProfile?.visualTone === "feminine"}
                  />
                  <span>
                    <span className="block font-medium">Feminine</span>
                    <span className="mt-1 flex gap-2">
                      <span className="h-5 w-10 rounded bg-rose-100" />
                      <span className="h-5 w-10 rounded bg-orange-50" />
                    </span>
                  </span>
                </label>
              </div>
            </fieldset>

            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Save profile
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Account</h2>
            <div className="mt-4">
              <DataRow label="Name" value={profile?.fullName ?? "Student"} />
              <DataRow label="Stage" value={studentProfile?.stage ?? "Not set"} />
              <DataRow label="Visual tone" value={studentProfile?.visualTone ?? "masculine"} />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Session</h2>
            <form action={signOutAction} className="mt-4">
              <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
                Sign out
              </button>
            </form>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
