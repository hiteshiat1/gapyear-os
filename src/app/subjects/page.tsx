import { createTopicAction, deleteSubjectAction, deleteTopicAction, saveSubjectAction } from "@/actions/subject-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader, ProgressBar } from "@/components/ui";
import { readinessScore } from "@/lib/analytics/calculations";
import { getExamErrors } from "@/lib/repositories/errors";
import { getExams } from "@/lib/repositories/exams";
import { getSubjects, getTopics } from "@/lib/repositories/subjects";

export default async function SubjectsPage() {
  const [subjects, topics, exams, errors] = await Promise.all([
    getSubjects(),
    getTopics(),
    getExams(),
    getExamErrors(),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Academic Recovery"
        title="Subjects"
        description="Create and manage active resit subjects, retained subjects, and topic readiness."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Add Subject</h2>
            <form action={saveSubjectAction} className="mt-4 space-y-3">
              <input name="name" placeholder="Mathematics" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="shortName" placeholder="Maths" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="achievedGrade" placeholder="B" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="targetGrade" placeholder="A*" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="active" type="checkbox" defaultChecked />
                Active resit subject
              </label>
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save subject</button>
            </form>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Add Topic</h2>
            <form action={createTopicAction} className="mt-4 space-y-3">
              <select name="subjectId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Choose subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <input name="name" placeholder="Electric Fields" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select name="status" defaultValue="Not Started" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  {["Not Started", "Learning", "Revised", "Practice Required", "Exam Ready", "Mastered"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <select name="priority" defaultValue="Medium" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  {["Low", "Medium", "High", "Critical"].map((priority) => (
                    <option key={priority}>{priority}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input name="confidence" type="number" min="1" max="5" placeholder="Confidence" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="accuracy" type="number" min="0" max="100" placeholder="Accuracy %" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <textarea name="notes" placeholder="Notes" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save topic</button>
            </form>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {subjects.length ? subjects.map((subject) => {
            const subjectTopics = topics.filter((topic) => topic.subjectId === subject.id);
            const readiness = readinessScore({
              subject,
              topics: subjectTopics,
              exams: exams.filter((exam) => exam.subjectId === subject.id),
              errors: errors.filter((entry) => entry.subjectId === subject.id),
              studySessions: [],
            });
            return (
              <Card key={subject.id} className={!subject.active ? "opacity-70" : undefined}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">{subject.name}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Achieved {subject.achievedGrade ?? "Unset"} · Target {subject.targetGrade ?? "Unset"}
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
                  <DataRow label="Estimated grade" value={subject.estimatedGrade ?? "Needs data"} />
                  <DataRow label="Latest mock grade" value={subject.latestMockGrade ?? "No mock"} />
                  <DataRow label="Readiness estimate" value={`${readiness}%`} />
                  <DataRow label="Topics" value={subjectTopics.length} />
                </div>
                <div className="mt-4 flex gap-2">
                  <form action={deleteSubjectAction}>
                    <input type="hidden" name="id" value={subject.id} />
                    <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">Archive</button>
                  </form>
                </div>
                <div className="mt-5 grid gap-3">
                  {subjectTopics.length ? subjectTopics.map((topic) => (
                    <div key={topic.id} className="rounded-lg border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium">{topic.name}</p>
                        <Badge tone={topic.priority === "Critical" ? "red" : topic.priority === "High" ? "amber" : "slate"}>
                          {topic.priority}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {topic.status} · confidence {topic.confidence ?? "-"}/5 · {topic.accuracy ?? "-"}% accuracy · {topic.errorCount} errors
                      </p>
                      <form action={deleteTopicAction} className="mt-2">
                        <input type="hidden" name="id" value={topic.id} />
                        <button className="text-xs font-medium text-slate-500">Archive topic</button>
                      </form>
                    </div>
                  )) : (
                    <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No topics yet.</p>
                  )}
                </div>
              </Card>
            );
          }) : (
            <Card className="lg:col-span-2">
              <p className="font-medium">No subjects yet.</p>
              <p className="mt-1 text-sm text-slate-500">Run the seed SQL or add the first subject using the form.</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
