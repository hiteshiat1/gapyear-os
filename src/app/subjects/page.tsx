import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader, ProgressBar } from "@/components/ui";
import { getMyOnboardingSubjects } from "@/lib/repositories/onboarding";

export default async function SubjectsPage() {
  const subjects = await getMyOnboardingSubjects();

  return (
    <AppShell>
      <PageHeader
        eyebrow="A Levels"
        title="Subjects"
        description="The subjects, boards, and grades you set during onboarding. Update this list from Onboarding."
      />

      <Card>
        {subjects.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Board</th>
                  <th className="py-2 pr-4">Self Grade</th>
                  <th className="py-2 pr-4">School Grade</th>
                  <th className="py-2 pr-4">Target Grade</th>
                  <th className="py-2 pr-4">Progress</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => (
                  <tr key={subject.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{subject.subjectName}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {subject.specificationCode ?? "Spec not set"}
                        {subject.confirmationStatus === "needs_confirmation" ? " · unconfirmed" : ""}
                      </p>
                    </td>
                    <td className="py-3 pr-4">{subject.boardName ?? "Not sure"}</td>
                    <td className="py-3 pr-4">{subject.selfGrade ?? "Not set"}</td>
                    <td className="py-3 pr-4">{subject.schoolPredictedGrade ?? "Not provided"}</td>
                    <td className="py-3 pr-4">{subject.targetGrade ?? "Not set"}</td>
                    <td className="py-3 pr-4">
                      {subject.topicSupportStatus === "full" && subject.progressPercent != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24">
                            <ProgressBar value={subject.progressPercent} />
                          </div>
                          <span className="text-xs font-medium">{subject.progressPercent}%</span>
                        </div>
                      ) : (
                        <Badge tone="amber">Coming soon</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium">No subjects selected yet.</p>
            <p className="mt-1 text-sm text-slate-500">Complete onboarding to select your A-Level subjects.</p>
            <Link
              href="/onboarding"
              className="mt-4 inline-block rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
            >
              Go to onboarding
            </Link>
          </div>
        )}
      </Card>
    </AppShell>
  );
}
