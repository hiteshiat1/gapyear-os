import { Badge, Card, PageHeader } from "@/components/ui";
import { getReferenceSpecifications, getExamBoards } from "@/lib/repositories/reference-data";

export default async function AdminSyllabusesPage() {
  const [specifications, boards] = await Promise.all([getReferenceSpecifications(), getExamBoards()]);
  const boardById = new Map(boards.map((board) => [board.id, board]));

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Syllabuses"
        description="All provisioned specifications across enabled and disabled subjects."
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                <th className="py-2 pr-4">Board</th>
                <th className="py-2 pr-4">Specification</th>
                <th className="py-2 pr-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {specifications.map((spec) => (
                <tr key={spec.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 pr-4">{boardById.get(spec.examBoardId)?.name ?? "Unknown"}</td>
                  <td className="py-3 pr-4">{spec.specificationCode} · {spec.specificationName}</td>
                  <td className="py-3 pr-4">
                    <Badge tone={spec.topicSupportStatus === "full" ? "green" : "amber"}>
                      {spec.topicSupportStatus === "full" ? "Ready" : "Coming soon"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
