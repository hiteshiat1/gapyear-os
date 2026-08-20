import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, ProgressBar } from "@/components/ui";

const goals = [
  ["Academic", "Hit target grades across all A-Level subjects", 44],
  ["Project", "Complete one substantial project", 18],
  ["Exposure", "Attend relevant events and build connections", 8],
  ["Portfolio", "Build documented evidence for UCAS", 22],
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
