import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, ProgressBar } from "@/components/ui";

const goals = [
  ["Academic", "A*AA across Maths, Further Maths, Physics", 44],
  ["Engineering", "Complete one substantial engineering project", 18],
  ["Startup", "Complete meaningful EV/drone startup work", 10],
  ["Exposure", "Attend relevant engineering and startup events", 8],
  ["Portfolio", "Build documented evidence of the gap year", 22],
] as const;

export default function GoalsPage() {
  return (
    <AppShell>
      <PageHeader eyebrow="Annual / Monthly / Weekly" title="Goals" />
      <div className="grid gap-6 lg:grid-cols-2">
        {goals.map(([area, goal, progress]) => (
          <Card key={area}>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-slate-500">{area}</p>
            <h2 className="mt-2 text-lg font-semibold">{goal}</h2>
            <div className="mt-4">
              <ProgressBar value={progress} />
              <p className="mt-2 text-sm text-slate-500">{progress}% evidence progress</p>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
