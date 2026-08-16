import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader, ProgressBar } from "@/components/ui";
import { readiness, subjects, topics } from "@/lib/data";

export default function SubjectsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Academic Recovery"
        title="Subjects"
        description="Track the active resit subjects separately while keeping Economics retained and inactive by default."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {subjects.map((subject) => {
          const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
          return (
            <Card key={subject.id} className={!subject.active ? "opacity-70" : undefined}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{subject.name}</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Achieved {subject.currentGrade} · Target {subject.targetGrade}
                  </p>
                </div>
                <Badge tone={subject.active ? "blue" : "slate"}>{subject.active ? "Active" : "Retained"}</Badge>
              </div>
              <div className="mt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">Syllabus completion</span>
                  <span className="font-medium">{subject.syllabusCompletion}%</span>
                </div>
                <ProgressBar value={subject.syllabusCompletion} />
              </div>
              <div className="mt-4">
                <DataRow label="Estimated grade" value={subject.estimatedGrade} />
                <DataRow label="Latest mock grade" value={subject.latestMockGrade} />
                <DataRow label="Readiness estimate" value={`${readiness(subject)}%`} />
                <DataRow label="Weak topics" value={subject.weakTopicCount} />
              </div>
              <div className="mt-5 grid gap-3">
                {subjectTopics.map((topic) => (
                  <div key={topic.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium">{topic.name}</p>
                      <Badge tone={topic.priority === "Critical" ? "red" : topic.priority === "High" ? "amber" : "slate"}>
                        {topic.priority}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {topic.status} · confidence {topic.confidence}/5 · {topic.accuracy}% accuracy · {topic.errors} errors
                    </p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
