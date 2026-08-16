import { createErrorAction, resolveErrorAction } from "@/actions/error-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { repeatedWeaknesses } from "@/lib/analytics/calculations";
import { getExamErrors } from "@/lib/repositories/errors";
import { getExams } from "@/lib/repositories/exams";
import { getSyllabusTopicsWithProgress } from "@/lib/repositories/syllabus";
import { getSubjects, getTopics } from "@/lib/repositories/subjects";

const categories = [
  "Knowledge Gap",
  "Formula Recall",
  "Conceptual Error",
  "Mathematical Error",
  "Misread Question",
  "Poor Explanation",
  "Missing Working",
  "Units",
  "Significant Figures",
  "Time Pressure",
  "Careless Error",
  "Practical / Experimental Question",
  "Graph / Interpretation",
  "Exam Technique",
  "Other",
];

export default async function ErrorLogPage() {
  const [errorEntries, subjects, topics, exams, syllabusTopics] = await Promise.all([
    getExamErrors(),
    getSubjects(),
    getTopics(),
    getExams(),
    getSyllabusTopicsWithProgress().catch(() => []),
  ]);
  const weaknesses = repeatedWeaknesses(errorEntries);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Error Recovery"
        title="Error Log"
        description="Every lost mark can become a corrective action. Repeated unresolved topic errors are flagged as critical weaknesses."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Add Error</h2>
            <form action={createErrorAction} className="mt-4 space-y-3">
              <select name="subjectId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Choose subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
              <select name="examId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Optional exam</option>
                {exams.map((exam) => (
                  <option key={exam.id} value={exam.id}>{exam.paper}</option>
                ))}
              </select>
              <select name="topicId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Optional tracked topic</option>
                {topics.map((topic) => (
                  <option key={topic.id} value={topic.id}>{topic.name}</option>
                ))}
              </select>
              <select name="syllabusTopicId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                <option value="">Optional syllabus topic</option>
                {syllabusTopics.filter((item) => item.topic.topicLevel !== "module").map((item) => (
                  <option key={item.topic.id} value={item.topic.id}>
                    {item.topic.paperCode} · {item.topic.name}
                  </option>
                ))}
              </select>
              <input name="topicName" placeholder="Topic name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="paperName" placeholder="Paper name" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="errorDate" type="date" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="questionNumber" placeholder="Q7" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="marksAvailable" type="number" min="0" placeholder="Marks available" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="marksLost" type="number" min="0" required placeholder="Marks lost" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <select name="category" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <textarea name="lessonLearned" placeholder="Lesson learned" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="correctiveAction" placeholder="Corrective action" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save error</button>
            </form>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Repeated Weaknesses</h2>
            <div className="mt-4 space-y-3">
              {weaknesses.length ? weaknesses.map((weakness) => (
                <div key={weakness.topic} className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                  <Badge tone="red">Critical Weakness</Badge>
                  <p className="mt-3 font-semibold text-rose-950">{weakness.topic}</p>
                  <p className="mt-1 text-sm text-rose-800">
                    Appeared in {weakness.count} unresolved errors. Suggested action: revise, targeted questions, tutor review, retest.
                  </p>
                </div>
              )) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No repeated unresolved weakness yet.</p>
              )}
            </div>
          </Card>
        </div>
        <Card>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Paper</th>
                  <th className="px-4 py-3 font-medium">Question</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Marks lost</th>
                  <th className="px-4 py-3 font-medium">Resolved</th>
                  <th className="px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {errorEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-4">{entry.errorDate}</td>
                    <td className="px-4 py-4">{entry.paperName ?? "-"}</td>
                    <td className="px-4 py-4">{entry.questionNumber ?? "-"}</td>
                    <td className="px-4 py-4">
                      {entry.syllabusTopicId ? (
                        <a href={`/topics/${entry.syllabusTopicId}`} className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">
                          {entry.topicName ?? "Syllabus topic"}
                        </a>
                      ) : (
                        entry.topicName ?? "Unassigned"
                      )}
                    </td>
                    <td className="px-4 py-4">{entry.category}</td>
                    <td className="px-4 py-4">{entry.marksLost}</td>
                    <td className="px-4 py-4">
                      <Badge tone={entry.resolved ? "green" : "amber"}>{entry.resolved ? "Yes" : "No"}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      {!entry.resolved ? (
                        <form action={resolveErrorAction} className="flex gap-2">
                          <input type="hidden" name="id" value={entry.id} />
                          <input name="retestResult" placeholder="Retest result" className="w-28 rounded-md border border-slate-300 px-2 py-1 text-xs" />
                          <button className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium">Resolve</button>
                        </form>
                      ) : (
                        <span className="text-xs text-slate-500">{entry.resolvedAt ?? "Resolved"}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {!errorEntries.length ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-slate-500">
                      No errors logged yet. Add missed marks after the next paper.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
