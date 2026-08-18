import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getFutureMapColumns } from "@/lib/repositories/future";

export default async function FutureMapPage() {
  const columns = await getFutureMapColumns().catch(() => []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Future Map"
        title="Possible Pathways"
        description="Connect subjects, strengths, course interests, university choices, evidence, skills, and career families without narrowing the student to one future."
      />

      <div className="mb-6 flex flex-wrap gap-2">
        <Link href="/explore" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">Explore interests</Link>
        <Link href="/universities" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">Universities</Link>
        <Link href="/careers" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">Careers</Link>
        <Link href="/ucas-evidence" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">UCAS evidence</Link>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="grid min-w-[1100px] grid-cols-6 gap-4">
          {columns.map((column, columnIndex) => (
            <div key={column.title} className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">{column.title}</h2>
                {columnIndex < columns.length - 1 ? <span className="text-slate-300">→</span> : null}
              </div>
              {column.nodes.length ? column.nodes.map((node) => (
                <Card key={node.id} className="p-4">
                  <Badge tone={toneForNode(node.nodeType)}>{node.nodeType.replaceAll("_", " ")}</Badge>
                  <p className="mt-3 font-semibold">{node.label}</p>
                  <p className="mt-2 text-sm text-slate-500">{node.detail ?? "Add detail to strengthen this branch."}</p>
                </Card>
              )) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Add data to create this branch.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function toneForNode(nodeType: string) {
  if (nodeType === "career_family") return "green";
  if (nodeType === "university_choice") return "amber";
  if (nodeType === "course_interest") return "blue";
  return "slate";
}
