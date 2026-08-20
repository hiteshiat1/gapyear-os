import { disableSubjectAction, enableSubjectAction, reprovisionSubjectAction } from "@/actions/admin-subject-actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getSubjectsForAdmin } from "@/lib/repositories/reference-data";

export default async function AdminSubjectsPage() {
  const subjects = await getSubjectsForAdmin();

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Subjects"
        description="Enable subjects for student selection. Enabling provisions AQA and Pearson Edexcel reference data where officially available."
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="py-2 pr-4">Student Visible</th>
                <th className="py-2 pr-4">Subject</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">AQA</th>
                <th className="py-2 pr-4">Edexcel</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((subject) => {
                const aqa = subject.provisioning.find((entry) => entry.boardCode === "AQA");
                const edexcel = subject.provisioning.find((entry) => entry.boardCode === "EDEXCEL");
                return (
                  <tr key={subject.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <Badge tone={subject.studentSelectable ? "green" : "slate"}>
                        {subject.studentSelectable ? "Enabled" : "Disabled"}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 font-medium">{subject.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{subject.category}</td>
                    <td className="py-3 pr-4"><StatusBadge status={aqa?.status} /></td>
                    <td className="py-3 pr-4"><StatusBadge status={edexcel?.status} /></td>
                    <td className="py-3 pr-4">
                      <div className="flex gap-2">
                        {subject.studentSelectable ? (
                          <form action={disableSubjectAction}>
                            <input type="hidden" name="subjectId" value={subject.id} />
                            <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
                              Disable
                            </button>
                          </form>
                        ) : (
                          <form action={enableSubjectAction}>
                            <input type="hidden" name="subjectId" value={subject.id} />
                            <button type="submit" className="rounded-md bg-slate-950 px-3 py-1.5 text-xs font-medium text-white">
                              Enable
                            </button>
                          </form>
                        )}
                        <form action={reprovisionSubjectAction}>
                          <input type="hidden" name="subjectId" value={subject.id} />
                          <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
                            Re-provision
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge tone="slate">Not checked</Badge>;
  if (status === "ready") return <Badge tone="green">Ready</Badge>;
  if (status === "coming_soon") return <Badge tone="amber">Coming soon</Badge>;
  if (status === "not_offered") return <Badge tone="slate">Not offered</Badge>;
  return <Badge tone="red">Error</Badge>;
}
