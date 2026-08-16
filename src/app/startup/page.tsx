import { createStartupExperienceAction, createStartupProblemAction } from "@/actions/startup-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getStartupExperiences, getStartupProblems } from "@/lib/repositories/startup";

const phases = [
  ["Weeks 1-2", "Observe EV architecture, batteries, BMS, controllers, drones, manufacturing, testing."],
  ["Weeks 3-4", "Interview engineers and log wasted time, failures, manual work, cost and customer pain."],
  ["Weeks 5-7", "Select one problem, prototype, test, fail, iterate."],
  ["Week 8", "Present problem, evidence, prototype, result, business value, next steps."],
];

export default async function StartupPage() {
  const [experiences, problems] = await Promise.all([
    getStartupExperiences(),
    getStartupProblems(),
  ]);
  const latestExperience = experiences[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Startup Exp"
        title="Startup Exp"
        description="Editable startup experience tracking for observation, problem discovery, build work, testing, and presentation evidence."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Experience Setup</h2>
            <form action={createStartupExperienceAction} className="mt-4 space-y-3">
              <input name="company" placeholder="Company" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="mentor" placeholder="Mentor" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input name="startsOn" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="endsOn" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <input name="department" placeholder="Department/team" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="objectives" placeholder="Objectives" className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save experience</button>
            </form>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Problem Discovery</h2>
            {latestExperience ? (
              <form action={createStartupProblemAction} className="mt-4 space-y-3">
                <input type="hidden" name="startupExperienceId" value={latestExperience.id} />
                <input name="problem" placeholder="Problem" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="whoExperiencesIt" placeholder="Who experiences it?" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <div className="grid grid-cols-2 gap-3">
                  <input name="frequency" placeholder="Frequency" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                  <input name="impact" placeholder="Impact" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                </div>
                <textarea name="existingSolution" placeholder="Existing solution" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <textarea name="possibleImprovement" placeholder="Possible improvement" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="status" placeholder="Status" defaultValue="Discovered" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save problem</button>
              </form>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                Add an experience first, then record discovered problems.
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Saved Experiences</h2>
            <div className="mt-4 space-y-4">
              {experiences.length ? experiences.map((experience) => (
                <div key={experience.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{experience.company || "Untitled experience"}</p>
                    <Badge tone="blue">Startup Exp</Badge>
                  </div>
                  <div className="mt-3">
                    <DataRow label="Mentor" value={experience.mentor || "Not set"} />
                    <DataRow label="Dates" value={`${experience.startsOn || "?"} to ${experience.endsOn || "?"}`} />
                    <DataRow label="Team" value={experience.department || "Not set"} />
                    <DataRow label="Objectives" value={experience.objectives || "Not set"} />
                  </div>
                </div>
              )) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No startup experience saved yet.</p>
              )}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Content Outline</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              {phases.map(([phase, detail]) => (
                <p key={phase}><strong>{phase}:</strong> {detail}</p>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Saved Problems</h2>
            <div className="mt-4 space-y-3">
              {problems.length ? problems.map((problem) => (
                <div key={problem.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium">{problem.problem}</p>
                    <Badge>{problem.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{problem.possibleImprovement || "No improvement logged yet."}</p>
                </div>
              )) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No problems logged yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
