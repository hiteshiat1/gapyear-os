import { saveOnboardingAction } from "@/actions/onboarding-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import { getSubjects } from "@/lib/repositories/subjects";

const subjectDefaults = [
  { name: "Mathematics", board: "Edexcel", spec: "9MA0", target: "A*" },
  { name: "Further Mathematics", board: "Edexcel", spec: "9FM0", target: "A" },
  { name: "Physics", board: "AQA", spec: "7408C", target: "A" },
  { name: "", board: "Not sure", spec: "Not sure", target: "" },
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function OnboardingPage() {
  const [profile, subjects] = await Promise.all([
    getStudentOnboardingProfile().catch(() => null),
    getSubjects(),
  ]);

  const subjectRows = subjectDefaults.map((fallback, index) => {
    const existing = subjects[index];
    return {
      name: existing?.name ?? fallback.name,
      examBoard: existing?.examBoard ?? fallback.board,
      specificationCode: existing?.specificationCode ?? fallback.spec,
      specificationOptions: existing?.specificationOptions ?? "",
      achievedGrade: existing?.achievedGrade ?? "",
      targetGrade: existing?.targetGrade ?? fallback.target,
      schoolPredictedGrade: existing?.schoolPredictedGrade ?? "",
    };
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Student Setup"
        title="ALevels.io Onboarding"
        description="Set the academic baseline once, then generate a starting plan from subjects, syllabus, goals, and available time."
      />

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
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
              <div className="mt-4 space-y-4">
                {subjectRows.map((subject, index) => (
                  <div key={index} className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        name={`subject_${index}_name`}
                        placeholder="Subject"
                        defaultValue={subject.name}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name={`subject_${index}_examBoard`}
                        placeholder="Exam board or Not sure"
                        defaultValue={subject.examBoard}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name={`subject_${index}_specificationCode`}
                        placeholder="Specification or Not sure"
                        defaultValue={subject.specificationCode}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name={`subject_${index}_specificationOptions`}
                        placeholder="Options, if relevant"
                        defaultValue={subject.specificationOptions}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name={`subject_${index}_achievedGrade`}
                        placeholder="Current / self estimate"
                        defaultValue={subject.achievedGrade ?? ""}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name={`subject_${index}_targetGrade`}
                        placeholder="Target grade"
                        defaultValue={subject.targetGrade ?? ""}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                      />
                      <input
                        name={`subject_${index}_schoolPredictedGrade`}
                        placeholder="School / UCAS prediction"
                        defaultValue={subject.schoolPredictedGrade ?? ""}
                        className="rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-3"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold">Available Time</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <input
                  name="weekdayStudyHours"
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="Weekday study hours"
                  defaultValue={profile?.weekdayStudyHours ?? ""}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
                <input
                  name="weekendStudyHours"
                  type="number"
                  min="0"
                  step="0.25"
                  placeholder="Weekend study hours"
                  defaultValue={profile?.weekendStudyHours ?? ""}
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

            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
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
              <DataRow label="Syllabus" value="Loaded where supported" />
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
