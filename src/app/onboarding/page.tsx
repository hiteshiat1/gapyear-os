import { saveOnboardingAction } from "@/actions/onboarding-actions";
import { seedReferenceDataAction } from "@/actions/reference-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import {
  getBoardOfferings,
  getGradeOptions,
  getReferenceOptions,
  getReferenceSpecifications,
  getReferenceSubjects,
} from "@/lib/repositories/reference-data";
import { getSubjects } from "@/lib/repositories/subjects";
import { ReferenceSubjectSelector } from "./reference-subject-selector";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, profile, subjects, referenceSubjects, boards, specifications, options, grades] = await Promise.all([
    searchParams,
    getStudentOnboardingProfile().catch(() => null),
    getSubjects(),
    getReferenceSubjects(),
    getBoardOfferings(),
    getReferenceSpecifications(),
    getReferenceOptions(),
    getGradeOptions(),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Student Setup"
        title="Alevs.io Onboarding"
        description="Set the academic baseline once, then generate a starting plan from subjects, syllabus, goals, and available time."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          {error ? (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          ) : null}
          {!referenceSubjects.length ? (
            <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <form action={seedReferenceDataAction}>
                <button type="submit" className="rounded-md bg-amber-900 px-4 py-2 text-sm font-medium text-white">
                  Load A Level Subjects (for our default subjects)
                </button>
              </form>
              <p className="mt-2 text-xs text-amber-700">Other subjects coming soon.</p>
            </div>
          ) : null}
          <form action={saveOnboardingAction} className="space-y-8">
            <section>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Student Profile</h2>
                <Badge tone={profile?.onboardingCompleted ? "green" : "amber"}>
                  {profile?.onboardingCompleted ? "Completed" : "In progress"}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  name="firstName"
                  placeholder="First name"
                  defaultValue={profile?.firstName ?? ""}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="schoolCollege"
                  placeholder="School / college"
                  defaultValue={profile?.schoolCollege ?? ""}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <select
                  name="stage"
                  defaultValue={profile?.stage ?? "Year 12"}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {["Year 12", "Year 13", "Resit-Gap Year"].map((stage) => (
                    <option key={stage}>{stage}</option>
                  ))}
                </select>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold">A-Level Subjects</h2>
              {referenceSubjects.length ? (
                <ReferenceSubjectSelector
                  subjects={referenceSubjects}
                  boards={boards}
                  specifications={specifications}
                  options={options}
                  grades={grades}
                />
              ) : (
                <p className="mt-4 text-sm text-slate-500">Load subjects above to continue.</p>
              )}
            </section>

            <section>
              <h2 className="text-lg font-semibold">Available Time</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  name="weekdayDefaultMinutes"
                  type="number"
                  min="0"
                  step="15"
                  placeholder="Weekday study minutes"
                  defaultValue={profile?.weekdayStudyHours ? Math.round(profile.weekdayStudyHours * 60) : ""}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="weekendDefaultMinutes"
                  type="number"
                  min="0"
                  step="15"
                  placeholder="Weekend study minutes"
                  defaultValue={profile?.weekendStudyHours ? Math.round(profile.weekendStudyHours * 60) : ""}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                {days.map((day) => (
                  <label key={day} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <input
                      name="lighterDays"
                      type="checkbox"
                      value={day}
                      defaultChecked={profile?.lighterDays.includes(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Visual Tone</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 p-4">
                  <input
                    name="visualTone"
                    type="radio"
                    value="masculine"
                    defaultChecked={(profile?.visualTone ?? "masculine") === "masculine"}
                  />
                  <span>
                    <span className="block font-medium">Option 1</span>
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
                    defaultChecked={profile?.visualTone === "feminine"}
                  />
                  <span>
                    <span className="block font-medium">Option 2</span>
                    <span className="mt-1 flex gap-2">
                      <span className="h-5 w-10 rounded bg-rose-100" />
                      <span className="h-5 w-10 rounded bg-orange-50" />
                    </span>
                  </span>
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Support And Known Assessments</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <textarea
                  name="tutors"
                  placeholder="Tutors, subjects, frequency"
                  defaultValue={profile?.tutors ?? ""}
                  className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <textarea
                  name="nextAssessments"
                  placeholder="Next mock / prelim / topic test dates"
                  defaultValue={profile?.nextAssessments ?? ""}
                  className="min-h-28 rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </section>

            <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Save onboarding and generate plan
            </button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">What Happens Next</h2>
            <div className="mt-4">
              <DataRow label="Subjects" value="Saved to your profile" />
              <DataRow label="Boards/specs" value="Can be Not sure" />
              <DataRow label="Syllabus" value="Canonical topics linked where supported" />
              <DataRow label="Plan" value="Initial 7 days generated" />
              <DataRow label="Progress" value="Starts blank, not invented" />
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Current Setup</h2>
            <div className="mt-4">
              <DataRow label="Stage" value={profile?.stage ?? "Not set"} />
              <DataRow label="School" value={profile?.schoolCollege ?? "Not set"} />
              <DataRow label="Subjects" value={subjects.length} />
              <DataRow label="Onboarding" value={profile?.onboardingCompleted ? "Complete" : "Incomplete"} />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
