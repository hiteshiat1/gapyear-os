import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader, ProgressBar, Stat } from "@/components/ui";
import { getDailyPlan } from "@/lib/repositories/daily-plans";
import { getExamErrors } from "@/lib/repositories/errors";
import { getExams } from "@/lib/repositories/exams";
import { getProjects } from "@/lib/repositories/projects";
import { getStudentOnboardingProfile, onboardingSummary } from "@/lib/repositories/onboarding";
import { firstName, getCurrentProfile } from "@/lib/repositories/profiles";
import { getSyllabusTopicsWithProgress } from "@/lib/repositories/syllabus";
import { getSubjects, getTopics } from "@/lib/repositories/subjects";
import { examPercentage, marksFromBoundary, readinessScore, repeatedWeaknesses } from "@/lib/analytics/calculations";
import type { Subject } from "@/types/domain";

export default async function Dashboard() {
  const [subjects, topics, dailyPlan, exams, errors, projects, syllabusTopics, onboarding] = await Promise.all([
    getSubjects(),
    getTopics(),
    getDailyPlan(),
    getExams(),
    getExamErrors(),
    getProjects(),
    getSyllabusTopicsWithProgress().catch(() => []),
    getStudentOnboardingProfile().catch(() => null),
  ]);
  const profile = await getCurrentProfile();
  const name = firstName(profile);

  const activeSubjects = subjects.filter((subject) => subject.active);
  const plannedHours = dailyPlan?.tasks.reduce((sum, task) => sum + (task.estimatedDuration ?? 0), 0) ?? 0;
  const completedHours = dailyPlan?.tasks.reduce((sum, task) => sum + (task.actualDuration ?? 0), 0) ?? 0;
  const nextMock = exams.find((exam) => exam.cycleStatus !== "Complete") ?? exams[0];
  const weakness = repeatedWeaknesses(errors)[0];
  const nextProject = projects[0];
  const tomorrowPriorities = syllabusTopics
    .filter((item) => item.topic.topicLevel !== "module")
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 4);
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell>
      <PageHeader
        eyebrow="Today"
        title="ALevels.io"
        description={`${name}'s personal A-Level plan across syllabus coverage, daily study, assessments, error analysis, and evidence.`}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <Stat label="Planned study" value={`${plannedHours}h`} detail="Normal cap: 6 focused academic hours" />
        </Card>
        <Card>
          <Stat label="Completed so far" value={`${completedHours}h`} detail="Tracked from today's tasks" />
        </Card>
        <Card>
          <Stat label="Study streak" value="Calculated after sessions" detail="Requires persisted study session history" />
        </Card>
        <Card>
          <Stat
            label="Onboarding"
            value={onboarding?.onboardingCompleted ? "Complete" : "Resume"}
            detail={onboardingSummary(onboarding, subjects)}
          />
        </Card>
      </div>

      {!onboarding?.onboardingCompleted ? (
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-medium text-amber-950">Finish student setup</p>
              <p className="mt-1 text-sm text-amber-800">
                Add stage, subjects, boards, grades, availability, and known assessment dates to generate a starting plan.
              </p>
            </div>
            <Link href="/onboarding" className="rounded-md bg-amber-900 px-3 py-2 text-sm font-medium text-white">
              Open onboarding
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Today&apos;s Focus</h2>
              <p className="mt-1 text-sm text-slate-500">{today}</p>
            </div>
            <Badge tone="blue">Academic work maintained</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {dailyPlan?.tasks.length ? (
              dailyPlan.tasks.map((task) => (
                <div
                  key={task.id}
                  className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[8rem_1fr_auto]"
                >
                  <p className="text-sm font-medium text-slate-500">
                    {task.startsAt ?? "--"}{task.endsAt ? `-${task.endsAt}` : ""}
                  </p>
                  <div>
                    <p className="font-medium text-slate-950">{task.task}</p>
                    <p className="mt-1 text-sm text-slate-500">{task.topic ?? task.category}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:justify-end">
                    <Badge tone={task.status === "Complete" ? "green" : task.status === "In Progress" ? "amber" : "slate"}>
                      {task.status}
                    </Badge>
                    <span className="text-sm font-medium">{task.estimatedDuration ?? 0}h</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No plan for today yet" action="Open Today to create a daily plan." />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Operating Signals</h2>
          <div className="mt-4">
            <DataRow label="Next tutoring session" value="Add tutoring sessions" />
            <DataRow label="Next mock" value={nextMock ? `${nextMock.paper}` : "No mock scheduled"} />
            <DataRow label="Next project action" value={nextProject?.status ?? "Add first project"} />
            <DataRow label="Journal" value={<Badge tone={dailyPlan?.eveningReflection ? "green" : "amber"}>{dailyPlan?.eveningReflection ? "Completed" : "Not completed"}</Badge>} />
          </div>
          {nextMock && nextMock.cycleStatus !== "Complete" ? (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
                <div>
                  <p className="font-medium text-amber-950">Paper cycle warning</p>
                  <p className="mt-1 text-sm text-amber-800">
                    {nextMock.paper} is {targetGap(nextMock)} and still marked {nextMock.cycleStatus}.
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Tomorrow&apos;s Highest Priorities</h2>
          <div className="mt-4 space-y-3">
            {tomorrowPriorities.length ? (
              tomorrowPriorities.map((item) => (
                <Link key={item.topic.id} href={`/topics/${item.topic.id}`} className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{item.topic.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.topic.paperCode} · {item.priorityReasons.join(", ")}</p>
                    </div>
                    <Badge tone={item.priorityLabel === "Critical" ? "red" : item.priorityLabel === "High" ? "amber" : "slate"}>
                      {item.priorityScore}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState title="No syllabus priorities yet" action="Load the syllabus in Settings." />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {activeSubjects.length ? (
          activeSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              readiness={readinessScore({
                subject,
                topics: topics.filter((topic) => topic.subjectId === subject.id),
                exams: exams.filter((exam) => exam.subjectId === subject.id),
                errors: errors.filter((entry) => entry.subjectId === subject.id),
                studySessions: [],
              })}
            />
          ))
        ) : (
          <Card className="lg:col-span-3">
            <EmptyState title="No subjects yet" action="Run the seed SQL or add subjects from the Subjects page." />
          </Card>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold">Current Performance</h2>
          <div className="mt-4 space-y-3">
            {exams.length ? (
              exams.slice(0, 5).map((exam) => (
                <div key={exam.id} className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium">{exam.paper}</p>
                    <p className="text-sm text-slate-500">{exam.rawMarks}/{exam.maxMarks} · {examPercentage(exam)}%</p>
                  </div>
                  <Badge tone={exam.cycleStatus === "Complete" ? "green" : "amber"}>{exam.grade ?? "Ungraded"}</Badge>
                </div>
              ))
            ) : (
              <EmptyState title="No mock papers yet" action="Add your first paper to begin tracking performance." />
            )}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Top Weakness</h2>
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-rose-700">Critical weakness</p>
            <p className="mt-2 text-xl font-semibold text-rose-950">{weakness?.topic ?? "No repeated weakness"}</p>
            <p className="mt-2 text-sm text-rose-800">
              {weakness ? `Appeared in ${weakness.count} unresolved errors.` : "Repeated weaknesses appear after 3+ unresolved topic errors."}
            </p>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Operating Loop</h2>
          <div className="mt-4 space-y-3">
            {["Plan today", "Study and track time", "Log mock score", "Analyse errors", "Schedule correction"].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span className="text-sm">{index + 1}. {item}</span>
              </div>
            ))}
          </div>
          <Link href="/today" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-950">
            Open today&apos;s plan <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}

function SubjectCard({ subject, readiness }: { subject: Subject; readiness: number }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">{subject.name}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Current {subject.achievedGrade ?? "Unset"} → Target {subject.targetGrade ?? "Unset"}
          </p>
        </div>
        <Badge tone={readiness >= 75 ? "green" : readiness >= 60 ? "amber" : "red"}>{readiness}% ready</Badge>
      </div>
      <div className="mt-5 space-y-4">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-slate-500">Syllabus completion</span>
            <span className="font-medium">{subject.syllabusCompletion}%</span>
          </div>
          <ProgressBar value={subject.syllabusCompletion} />
        </div>
        <DataRow label="Estimated grade" value={subject.estimatedGrade ?? "Needs data"} />
        <DataRow label="Latest mock" value={subject.latestMockGrade ?? "No mock"} />
        <DataRow label="This week" value={`${subject.studyHoursThisWeek}h`} />
        <DataRow label="Weak topics" value={subject.weakTopicCount} />
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="text-sm text-slate-500">Next action</p>
          <p className="mt-1 text-sm font-medium">{subject.nextAction}</p>
        </div>
      </div>
    </Card>
  );
}

function EmptyState({ title, action }: { title: string; action: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
      <p className="font-medium text-slate-900">{title}</p>
      <p className="mt-1">{action}</p>
    </div>
  );
}

function targetGap(exam: { rawMarks: number; targetBoundary: number | null; targetGrade: string | null }) {
  const gap = marksFromBoundary(exam.rawMarks, exam.targetBoundary);
  if (gap === null) return "missing a target boundary";
  if (gap === 0) return `at ${exam.targetGrade ?? "target"}`;
  return `${gap} marks from ${exam.targetGrade ?? "target"}`;
}
