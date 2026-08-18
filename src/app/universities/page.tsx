import { createUniversityChoiceAction } from "@/actions/future-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getUniversityChoicesWithGapAnalysis } from "@/lib/repositories/future";

const statuses = ["exploring", "shortlist", "aspirational", "realistic", "safety", "applied", "offer", "rejected", "withdrawn"];

export default async function UniversitiesPage() {
  const choices = await getUniversityChoicesWithGapAnalysis().catch(() => []);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Universities"
        title="Course Shortlist"
        description="Save university/course possibilities and compare published requirements with current evidence without implying admissions certainty."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.3fr]">
        <Card>
          <h2 className="text-lg font-semibold">Add University Choice</h2>
          <form action={createUniversityChoiceAction} className="mt-4 space-y-3">
            <input name="university" placeholder="University" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="course" placeholder="Course" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input name="entryYear" placeholder="Entry year" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="typicalEntryRequirements" placeholder="Typical requirements, e.g. A*AA" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <input name="requiredSubjects" placeholder="Required subjects" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="contextualRequirements" placeholder="Contextual requirements, if available" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="admissionsTests" placeholder="Admissions tests / interviews" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <select name="interestLevel" defaultValue="3" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                {[1, 2, 3, 4, 5].map((level) => (
                  <option key={level} value={level}>Interest {level}/5</option>
                ))}
              </select>
              <select name="status" defaultValue="exploring" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
            </div>
            <input name="sourceUrl" placeholder="Source URL" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="lastChecked" type="date" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <textarea name="notes" placeholder="Notes" className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save choice</button>
          </form>
        </Card>

        <div className="space-y-4">
          {choices.length ? choices.map(({ choice, gap }) => (
            <Card key={choice.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{choice.university}</h2>
                  <p className="mt-1 text-sm text-slate-500">{choice.course}</p>
                </div>
                <Badge tone={choice.status === "aspirational" ? "amber" : choice.status === "offer" ? "green" : "blue"}>
                  {choice.status}
                </Badge>
              </div>
              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <DataRow label="Typical profile" value={choice.typicalEntryRequirements ?? "Not entered"} />
                  <DataRow label="Required subjects" value={choice.requiredSubjects ?? "Not entered"} />
                  <DataRow label="Admissions tests" value={choice.admissionsTests ?? "Not entered"} />
                  <DataRow label="Last checked" value={choice.lastChecked ?? "Not tracked"} />
                </div>
                <div className="rounded-lg border border-slate-200 p-4">
                  <Badge tone={gap.label === "below typical profile" ? "amber" : gap.label === "needs manual review" ? "slate" : "green"}>
                    {gap.label}
                  </Badge>
                  <p className="mt-3 text-sm text-slate-700">{gap.gap}</p>
                  <p className="mt-2 text-sm text-slate-500">{gap.nextStep}</p>
                </div>
              </div>
            </Card>
          )) : (
            <Card>
              <p className="text-sm text-slate-500">No university choices saved yet.</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}
