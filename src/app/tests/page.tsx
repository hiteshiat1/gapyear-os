import { createExamAction, deleteExamAction } from "@/actions/exam-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { examPercentage, marksFromBoundary } from "@/lib/analytics/calculations";
import { getExams } from "@/lib/repositories/exams";
import { getSubjects } from "@/lib/repositories/subjects";

export default async function TestsPage() {
  const [exams, subjects] = await Promise.all([getExams(), getSubjects()]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Assessments"
        title="Assessment Evidence"
        description="Diagnostics, homework tests, topic tests, school tests, mocks, prelims, exams, tutor assessments, and past papers all feed the same evidence loop."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Add Assessment</h2>
          <form action={createExamAction} className="mt-4 space-y-3">
            <select name="subjectId" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Choose subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
            <select name="examType" defaultValue="Mock" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {[
                "Diagnostic",
                "Homework Test",
                "Topic Test",
                "School Test",
                "Mock",
                "Prelim",
                "AS Exam",
                "A-Level Exam",
                "Tutor Assessment",
                "Past Paper",
              ].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <input name="paper" placeholder="AQA 2023 Paper 1" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input name="examBoard" placeholder="Exam board" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="paperYear" placeholder="Year" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="paperCode" placeholder="Paper code, e.g. 7408-P1" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="paperSection" placeholder="Paper section" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <input name="completedOn" type="date" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input name="rawMarks" type="number" min="0" placeholder="Raw marks" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="maxMarks" type="number" min="1" placeholder="Max marks" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="grade" placeholder="Grade" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="targetGrade" placeholder="Target grade" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="nextBoundary" type="number" placeholder="Next boundary" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="targetBoundary" type="number" placeholder="Target boundary" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input name="timed" type="checkbox" defaultChecked />
              Timed
            </label>
            <select name="cycleStatus" defaultValue="Needs error review" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {["Needs marking", "Needs error review", "Corrections scheduled", "Complete"].map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
            <textarea name="notes" placeholder="Notes" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">
              Upload extraction is staged for the next milestone. OCR/AI values will require confirmation before analytics.
            </div>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save assessment</button>
          </form>
        </Card>
        <Card>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Paper</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                  <th className="px-4 py-3 font-medium">Target gap</th>
                  <th className="px-4 py-3 font-medium">Cycle</th>
                  <th className="px-4 py-3 font-medium">Archive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {exams.map((exam) => {
                  const gap = marksFromBoundary(exam.rawMarks, exam.targetBoundary);
                  return (
                    <tr key={exam.id}>
                      <td className="px-4 py-4">{exam.completedOn}</td>
                      <td className="px-4 py-4">
                        <p className="font-medium">{exam.paper}</p>
                        {exam.paperCode ? <p className="mt-1 text-xs text-slate-500">{exam.paperCode}{exam.paperSection ? ` · ${exam.paperSection}` : ""}</p> : null}
                      </td>
                      <td className="px-4 py-4">{exam.rawMarks}/{exam.maxMarks} · {examPercentage(exam)}%</td>
                      <td className="px-4 py-4">{exam.grade ?? "-"}</td>
                      <td className="px-4 py-4">
                        {gap === null ? "Boundary missing" : gap === 0 ? "At target" : `${gap} marks from ${exam.targetGrade ?? "target"}`}
                      </td>
                      <td className="px-4 py-4">
                        <Badge tone={exam.cycleStatus === "Complete" ? "green" : "amber"}>{exam.cycleStatus}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <form action={deleteExamAction}>
                          <input type="hidden" name="id" value={exam.id} />
                          <button className="text-xs font-medium text-slate-500">Archive</button>
                        </form>
                      </td>
                    </tr>
                  );
                })}
                {!exams.length ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                      No mock papers yet. Add your first paper to begin tracking performance.
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
