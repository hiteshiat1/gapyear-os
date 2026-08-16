import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { errorEntries, repeatedWeaknesses, subjectName } from "@/lib/data";

export default function ErrorLogPage() {
  const weaknesses = repeatedWeaknesses();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Error Recovery"
        title="Error Log"
        description="Every lost mark can become a corrective action. Repeated errors are flagged so review quality matters more than paper volume."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Repeated Weaknesses</h2>
          <div className="mt-4 space-y-3">
            {weaknesses.map((weakness) => (
              <div key={weakness.topic} className="rounded-lg border border-rose-200 bg-rose-50 p-4">
                <Badge tone="red">Critical Weakness</Badge>
                <p className="mt-3 font-semibold text-rose-950">{weakness.topic}</p>
                <p className="mt-1 text-sm text-rose-800">
                  Appeared in {weakness.count} errors. Generate remediation: revise, 20 targeted questions, tutor review, retest in 7 days.
                </p>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full min-w-[920px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Paper</th>
                  <th className="px-4 py-3 font-medium">Question</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Category</th>
                  <th className="px-4 py-3 font-medium">Marks lost</th>
                  <th className="px-4 py-3 font-medium">Resolved</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {errorEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-4">{entry.date}</td>
                    <td className="px-4 py-4 font-medium">{subjectName(entry.subjectId)}</td>
                    <td className="px-4 py-4">{entry.paper}</td>
                    <td className="px-4 py-4">{entry.question}</td>
                    <td className="px-4 py-4">{entry.topic}</td>
                    <td className="px-4 py-4">{entry.category}</td>
                    <td className="px-4 py-4">{entry.marksLost}</td>
                    <td className="px-4 py-4">
                      <Badge tone={entry.resolved ? "green" : "amber"}>{entry.resolved ? "Yes" : "No"}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
