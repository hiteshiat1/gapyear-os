import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader, ProgressBar, Stat } from "@/components/ui";
import {
  dailyTasks,
  exams,
  examPercentage,
  marksFromTarget,
  portfolioProjects,
  readiness,
  repeatedWeaknesses,
  subjects,
} from "@/lib/data";

export default function Dashboard() {
  const activeSubjects = subjects.filter((subject) => subject.active);
  const plannedHours = dailyTasks.reduce((sum, task) => sum + task.plannedHours, 0);
  const completedHours = dailyTasks.reduce((sum, task) => sum + task.actualHours, 0);
  const nextMock = exams[0];
  const weakness = repeatedWeaknesses()[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Today"
        title="Sachith Gap-Year OS"
        description="A focused daily operating system for academic recovery, engineering evidence, startup learning, and portfolio outcomes."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <Stat label="Planned study" value={`${plannedHours}h`} detail="Normal cap: 6 focused academic hours" />
        </Card>
        <Card>
          <Stat label="Completed so far" value={`${completedHours}h`} detail="Continue with the current block" />
        </Card>
        <Card>
          <Stat label="Study streak" value="5 days" detail="Subtle consistency indicator" />
        </Card>
        <Card>
          <Stat label="Objective" value="A*AA" detail="Maths, Further Maths, Physics" />
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
          <h2 className="text-lg font-semibold">Today&apos;s Focus</h2>
              <p className="mt-1 text-sm text-slate-500">Sunday, 16 August 2026</p>
            </div>
            <Badge tone="blue">Academic work maintained</Badge>
          </div>
          <div className="mt-5 grid gap-3">
            {dailyTasks.map((task) => (
              <div
                key={task.id}
                className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[8rem_1fr_auto]"
              >
                <p className="text-sm font-medium text-slate-500">{task.time}</p>
                <div>
                  <p className="font-medium text-slate-950">{task.task}</p>
                  <p className="mt-1 text-sm text-slate-500">{task.topic}</p>
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Badge tone={task.status === "Complete" ? "green" : task.status === "In Progress" ? "amber" : "slate"}>
                    {task.status}
                  </Badge>
                  <span className="text-sm font-medium">{task.plannedHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Operating Signals</h2>
          <div className="mt-4">
            <DataRow label="Next tutoring session" value="Physics, Tuesday 17:00" />
            <DataRow label="Next mock" value={`${nextMock.title}, Saturday`} />
            <DataRow label="Next engineering action" value={portfolioProjects[0].next} />
            <DataRow label="Journal" value={<Badge tone="amber">Not completed</Badge>} />
          </div>
          <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-700" />
              <div>
                <p className="font-medium text-amber-950">Paper cycle warning</p>
                <p className="mt-1 text-sm text-amber-800">
                  {nextMock.title} is {marksFromTarget(nextMock)} marks from {nextMock.targetGrade} and still needs error review.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {activeSubjects.map((subject) => (
          <Card key={subject.id}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{subject.name}</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Current {subject.currentGrade} → Target {subject.targetGrade}
                </p>
              </div>
              <Badge tone={readiness(subject) >= 75 ? "green" : readiness(subject) >= 60 ? "amber" : "red"}>
                {readiness(subject)}% ready
              </Badge>
            </div>
            <div className="mt-5 space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">Syllabus completion</span>
                  <span className="font-medium">{subject.syllabusCompletion}%</span>
                </div>
                <ProgressBar value={subject.syllabusCompletion} />
              </div>
              <DataRow label="Estimated grade" value={subject.estimatedGrade} />
              <DataRow label="Latest mock" value={subject.latestMockGrade} />
              <DataRow label="This week" value={`${subject.studyHoursThisWeek}h`} />
              <DataRow label="Weak topics" value={subject.weakTopicCount} />
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-slate-500">Next action</p>
                <p className="mt-1 text-sm font-medium">{subject.nextAction}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card>
          <h2 className="text-lg font-semibold">Current Performance</h2>
          <div className="mt-4 space-y-3">
            {exams.map((exam) => (
              <div key={exam.id} className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">{exam.title}</p>
                  <p className="text-sm text-slate-500">{exam.rawMarks}/{exam.maxMarks} · {examPercentage(exam)}%</p>
                </div>
                <Badge tone={exam.cycleStatus === "Complete" ? "green" : "amber"}>{exam.grade}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Top Weakness</h2>
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4">
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-rose-700">Critical weakness</p>
            <p className="mt-2 text-xl font-semibold text-rose-950">{weakness?.topic ?? "No repeated weakness"}</p>
            <p className="mt-2 text-sm text-rose-800">
              Appeared in {weakness?.count ?? 0} logged errors. Suggested action: revise topic, complete targeted questions, tutor review, retest in 7 days.
            </p>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">V1 Loop</h2>
          <div className="mt-4 space-y-3">
            {["Plan today", "Study and track time", "Log mock score", "Analyse errors", "Schedule correction"].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                <span className="text-sm">{index + 1}. {item}</span>
              </div>
            ))}
          </div>
          <Link
            href="/today"
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-slate-950"
          >
            Open today&apos;s plan <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}
