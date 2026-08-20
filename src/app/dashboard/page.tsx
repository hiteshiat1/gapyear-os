import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader, ProgressBar, Stat } from "@/components/ui";
import { getDailyPlan } from "@/lib/repositories/daily-plans";
import { getExams } from "@/lib/repositories/exams";
import { getMyOnboardingSubjects, getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import { firstName, getCurrentProfile } from "@/lib/repositories/profiles";
import { progressLabelFromEvidence } from "@/lib/analytics/calculations";

export default async function DashboardPage() {
  const [profile, studentProfile, subjects, dailyPlan, exams] = await Promise.all([
    getCurrentProfile(),
    getStudentOnboardingProfile().catch(() => null),
    getMyOnboardingSubjects(),
    getDailyPlan(),
    getExams(),
  ]);
  const name = firstName(profile);
  const plannedHours = dailyPlan?.tasks.reduce((sum, task) => sum + (task.estimatedDuration ?? 0), 0) ?? 0;
  const completedHours = dailyPlan?.tasks.reduce((sum, task) => sum + (task.actualDuration ?? 0), 0) ?? 0;
  const tasksCompleted = dailyPlan?.tasks.filter((task) => task.status === "Complete").length ?? 0;
  const nextMock = exams.find((exam) => exam.cycleStatus !== "Complete");

  return (
    <AppShell>
      <PageHeader
        eyebrow={studentProfile ? `${studentProfile.stage}${studentProfile.schoolCollege ? ` · ${studentProfile.schoolCollege}` : ""}` : undefined}
        title={`Hi ${name}`}
        description="Your A-Level subjects, plan, and progress at a glance."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card><Stat label="Study hours this week" value={`${plannedHours}h`} detail={`${completedHours}h completed`} /></Card>
        <Card><Stat label="Tasks completed" value={String(tasksCompleted)} detail="From today's plan" /></Card>
        <Card><Stat label="Next mock" value={nextMock ? nextMock.paper : "None scheduled"} detail={nextMock?.completedOn ?? undefined} /></Card>
      </div>

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Your Subjects</h2>
        {subjects.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                  <th className="py-2 pr-4">Subject</th>
                  <th className="py-2 pr-4">Board</th>
                  <th className="py-2 pr-4">Self / School / Target</th>
                  <th className="py-2 pr-4">Progress</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => {
                  const label = progressLabelFromEvidence({
                    topicCount: subject.topicSupportStatus === "full" ? 10 : 0,
                    percent: subject.progressPercent,
                  });
                  return (
                    <tr key={subject.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium">{subject.subjectName}</td>
                      <td className="py-3 pr-4">{subject.boardName ?? "Not sure"}</td>
                      <td className="py-3 pr-4">
                        {subject.selfGrade ?? "–"} / {subject.schoolPredictedGrade ?? "–"} / {subject.targetGrade ?? "–"}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          {subject.progressPercent != null ? (
                            <div className="w-20"><ProgressBar value={subject.progressPercent} /></div>
                          ) : null}
                          <Badge tone={label === "On track" ? "green" : label === "Needs attention" ? "red" : "slate"}>{label}</Badge>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">
            No subjects yet. <Link href="/onboarding" className="font-medium underline">Complete onboarding</Link> to select your A-Levels.
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Today&apos;s Plan</h2>
          <Link href="/today" className="inline-flex items-center gap-1 text-sm font-medium text-slate-950">
            Open Plan <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4">
          <DataRow label="Tasks today" value={dailyPlan?.tasks.length ?? 0} />
          <DataRow label="Planned hours" value={`${plannedHours}h`} />
        </div>
      </Card>
    </AppShell>
  );
}
