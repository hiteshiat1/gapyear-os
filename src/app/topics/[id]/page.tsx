import Link from "next/link";
import { notFound } from "next/navigation";
import { createTopicDiagnosticAction } from "@/actions/syllabus-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getTopicDetail } from "@/lib/repositories/syllabus";

export default async function TopicDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let detail: Awaited<ReturnType<typeof getTopicDetail>>;

  try {
    detail = await getTopicDetail(id);
  } catch {
    notFound();
  }

  return (
    <AppShell>
      <PageHeader
        eyebrow={`${detail.topic.specificationCode} · ${detail.topic.specificationRef}`}
        title={detail.topic.name}
        description={`${detail.topic.paperName} · ${detail.topic.topicLevel}`}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <div className="space-y-6">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg font-semibold">Topic Status</h2>
              <Badge tone={detail.priorityLabel === "Critical" ? "red" : detail.priorityLabel === "High" ? "amber" : "slate"}>
                Priority {detail.priorityScore}
              </Badge>
            </div>
            <div className="mt-4">
              <DataRow label="Status" value={detail.progress?.status ?? "Not Started"} />
              <DataRow label="Confidence" value={detail.progress?.confidence ? `${detail.progress.confidence} / 5` : "Not assessed"} />
              <DataRow label="Accuracy" value={detail.progress?.accuracy != null ? `${detail.progress.accuracy}%` : "Not assessed"} />
              <DataRow label="Last revised" value={detail.progress?.lastRevised ?? "Not assessed"} />
              <DataRow label="Retest date" value={detail.progress?.retestDate ?? "Not scheduled"} />
              <DataRow label="Unresolved errors" value={detail.unresolvedErrors} />
              <DataRow label="Marks lost" value={detail.marksLost} />
            </div>
            <div className="mt-4 rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-medium">Priority reasons</p>
              <p className="mt-1 text-sm text-slate-500">{detail.priorityReasons.join(", ")}</p>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Specification Mapping</h2>
            <div className="mt-4">
              <DataRow label="Stable code" value={detail.topic.stableCode} />
              <DataRow label="Specification ref" value={detail.topic.specificationRef} />
              <DataRow label="Paper code" value={detail.topic.paperCode} />
              <DataRow label="Paper" value={detail.topic.paperName} />
              <DataRow label="Optional" value={detail.topic.isOptional ? "Yes" : "No"} />
            </div>
            <Link href="/settings/syllabus" className="mt-4 inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">
              Back to syllabus
            </Link>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Add Diagnostic</h2>
            <form action={createTopicDiagnosticAction} className="mt-4 grid gap-3 md:grid-cols-2">
              <input type="hidden" name="subjectId" value={detail.topic.subjectId} />
              <input type="hidden" name="syllabusTopicId" value={detail.topic.id} />
              <input name="diagnosticDate" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="questionsAttempted" type="number" min="0" placeholder="Questions attempted" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="correct" type="number" min="0" placeholder="Correct" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="marksScored" type="number" min="0" required placeholder="Marks scored" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="marksAvailable" type="number" min="1" required placeholder="Marks available" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="confidenceBefore" type="number" min="1" max="5" placeholder="Confidence before" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="confidenceAfter" type="number" min="1" max="5" placeholder="Confidence after" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="notes" placeholder="Notes" className="min-h-20 rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2" />
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white md:col-span-2">Save diagnostic</button>
            </form>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Recent Diagnostics</h2>
            <div className="mt-4 space-y-3">
              {detail.diagnostics.length ? (
                detail.diagnostics.map((diagnostic) => (
                  <div key={diagnostic.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-center justify-between gap-4">
                      <p className="font-medium">{diagnostic.diagnosticDate}</p>
                      <Badge tone={diagnostic.percentage >= 85 ? "green" : diagnostic.percentage < 60 ? "red" : "amber"}>
                        {diagnostic.percentage}%
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">
                      {diagnostic.marksScored}/{diagnostic.marksAvailable} marks
                      {diagnostic.confidenceAfter ? ` · confidence ${diagnostic.confidenceAfter}/5` : ""}
                    </p>
                    {diagnostic.notes ? <p className="mt-2 text-sm text-slate-600">{diagnostic.notes}</p> : null}
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
                  No diagnostics logged for this topic yet.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
