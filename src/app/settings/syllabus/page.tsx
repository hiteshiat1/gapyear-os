import Link from "next/link";
import { seedSyllabusesAction, resetTopicProgressAction } from "@/actions/syllabus-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader, ProgressBar } from "@/components/ui";
import { getMyOnboardingSubjects } from "@/lib/repositories/onboarding";
import { getSyllabusLoadStatus, getSyllabusTopicsWithProgress } from "@/lib/repositories/syllabus";

const statuses = ["Not Started", "Learning", "Revised", "Practice Required", "Exam Ready", "Mastered"];

export default async function SyllabusSettingsPage() {
  const [allLoadStatus, topics, selectedSubjects] = await Promise.all([
    getSyllabusLoadStatus(),
    getSyllabusTopicsWithProgress(),
    getMyOnboardingSubjects(),
  ]);
  const selectedNames = new Set(selectedSubjects.map((subject) => subject.subjectName.trim().toLowerCase()));
  const loadStatus = allLoadStatus.filter((status) => selectedNames.has(status.subjectName.trim().toLowerCase()));
  const bySubject = new Map(loadStatus.map((status) => [status.subjectId, status]));
  const subjectGroups = loadStatus.map((status) => ({
    ...status,
    topics: topics.filter((topic) => topic.topic.subjectId === status.subjectId),
  }));
  const selectedSubjectIds = new Set(loadStatus.map((status) => status.subjectId).filter(Boolean));
  const highestPriority = topics
    .filter((topic) => topic.topic.topicLevel !== "module" && selectedSubjectIds.has(topic.topic.subjectId))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 12);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings · Academic Setup"
        title="Syllabus"
        description="Load official specification-backed reference topics, inspect coverage, and keep student progress separate from curriculum structure."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Syllabus Loader</h2>
              <form action={seedSyllabusesAction}>
                <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
                  Load / repair syllabus
                </button>
              </form>
            </div>
            <div className="mt-4 space-y-3">
              {loadStatus.map((status) => (
                <div key={status.key} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold">{status.subjectName}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {status.examBoard} {status.specificationCode}
                        {status.optionCode ? ` · ${status.optionCode}` : ""}
                      </p>
                    </div>
                    <Badge tone={status.loaded ? "green" : "amber"}>
                      {status.loaded ? "Loaded" : "Needs load"}
                    </Badge>
                  </div>
                  <div className="mt-3">
                    <DataRow label="Expected topics" value={status.expectedTopics} />
                    <DataRow label="Loaded topics" value={status.loadedTopics} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Reset Progress</h2>
            <p className="mt-2 text-sm text-slate-500">
              This clears topic progress, confidence, accuracy, tutor flags, and retest dates. It does not delete syllabus topics,
              exams, errors, diagnostics, or history.
            </p>
            <form action={resetTopicProgressAction} className="mt-4 grid gap-3">
              <input
                name="confirmation"
                placeholder="RESET PROGRESS"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700">
                Reset topic progress
              </button>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Coverage</h2>
            <div className="mt-4 space-y-5">
              {subjectGroups.map((group) => {
                const complete = group.topics.filter((topic) =>
                  ["Exam Ready", "Mastered"].includes(topic.progress?.status ?? ""),
                ).length;
                const percent = group.topics.length ? Math.round((complete / group.topics.length) * 100) : 0;
                const counts = countStatuses(group.topics);
                return (
                  <div key={group.key} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold">{group.subjectName}</h3>
                      <span className="text-sm font-medium">{percent}%</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar value={percent} />
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {statuses.map((status) => (
                        <DataRow key={status} label={status} value={counts.get(status) ?? 0} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Tomorrow&apos;s Highest Priorities</h2>
            <div className="mt-4 space-y-3">
              {highestPriority.length ? (
                highestPriority.map((item) => (
                  <Link
                    key={item.topic.id}
                    href={`/topics/${item.topic.id}`}
                    className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{item.topic.name}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {bySubject.get(item.topic.subjectId)?.shortName ?? item.topic.specificationCode} · {item.topic.paperCode}
                        </p>
                      </div>
                      <Badge tone={item.priorityLabel === "Critical" ? "red" : item.priorityLabel === "High" ? "amber" : "slate"}>
                        {item.priorityScore}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{item.priorityReasons.join(", ")}</p>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  Load the syllabus to calculate priorities.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function countStatuses(items: Awaited<ReturnType<typeof getSyllabusTopicsWithProgress>>) {
  const counts = new Map<string, number>();
  for (const item of items) {
    const status = item.progress?.status ?? "Not Started";
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }
  return counts;
}
