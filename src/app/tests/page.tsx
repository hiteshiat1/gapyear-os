import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { exams, examPercentage, marksFromTarget, subjectName } from "@/lib/data";

export default function TestsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Tests & Mocks"
        title="Paper Completion Cycle"
        description="A paper only counts as complete after it is completed, marked, errors are logged, corrections are done, weak topics are identified, and a retest is scheduled."
      />
      <Card>
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Subject</th>
                <th className="px-4 py-3 font-medium">Paper</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Grade</th>
                <th className="px-4 py-3 font-medium">Target gap</th>
                <th className="px-4 py-3 font-medium">Cycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {exams.map((exam) => (
                <tr key={exam.id}>
                  <td className="px-4 py-4">{exam.date}</td>
                  <td className="px-4 py-4 font-medium">{subjectName(exam.subjectId)}</td>
                  <td className="px-4 py-4">{exam.paper}</td>
                  <td className="px-4 py-4">{exam.rawMarks}/{exam.maxMarks} · {examPercentage(exam)}%</td>
                  <td className="px-4 py-4">{exam.grade}</td>
                  <td className="px-4 py-4">
                    {marksFromTarget(exam) === 0 ? "At target" : `${marksFromTarget(exam)} marks from ${exam.targetGrade}`}
                  </td>
                  <td className="px-4 py-4">
                    <Badge tone={exam.cycleStatus === "Complete" ? "green" : "amber"}>{exam.cycleStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}
