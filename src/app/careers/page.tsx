import { saveCareerInterestAction } from "@/actions/future-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getCareerFamilies, getStudentCareerInterests } from "@/lib/repositories/future";

export default async function CareersPage() {
  const [families, interests] = await Promise.all([
    getCareerFamilies(),
    getStudentCareerInterests().catch(() => []),
  ]);
  const byFamily = new Map(interests.map((interest) => [interest.careerFamilyId, interest]));

  return (
    <AppShell>
      <PageHeader
        eyebrow="Careers"
        title="Career Families"
        description="Explore broad families, example roles, skills, and common degree routes as possibilities rather than fixed predictions."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {families.map((family) => {
          const saved = byFamily.get(family.id);
          return (
            <Card key={family.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{family.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{family.description}</p>
                </div>
                {saved ? <Badge tone="green">Saved</Badge> : <Badge tone="slate">Explore</Badge>}
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <MiniList title="Roles" items={family.exampleRoles} />
                <MiniList title="Skills" items={family.skills} />
                <MiniList title="Degree routes" items={family.typicalDegreeRoutes} />
              </div>
              <form action={saveCareerInterestAction} className="mt-4 grid gap-3 md:grid-cols-[8rem_1fr_auto]">
                <input type="hidden" name="careerFamilyId" value={family.id} />
                <select name="interestLevel" defaultValue={saved?.interestLevel ?? 3} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <option key={level} value={level}>{level}/5</option>
                  ))}
                </select>
                <input name="reason" defaultValue={saved?.reason ?? ""} placeholder="Why this family is worth exploring" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save</button>
              </form>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{title}</p>
      <ul className="mt-2 space-y-1 text-sm text-slate-600">
        {items.slice(0, 4).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
