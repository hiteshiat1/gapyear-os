import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { dailyTasks } from "@/lib/data";

export default function TodayPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Daily Plan"
        title="Today"
        description="Default academic plan: 2 hours Physics, 2 hours Mathematics, 2 hours Further Mathematics. Startup or travel days can split the same target into morning and evening blocks."
      />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Schedule</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Task</th>
                  <th className="px-4 py-3 font-medium">Topic</th>
                  <th className="px-4 py-3 font-medium">Planned</th>
                  <th className="px-4 py-3 font-medium">Actual</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dailyTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-4 font-medium">{task.time}</td>
                    <td className="px-4 py-4">{task.task}</td>
                    <td className="px-4 py-4 text-slate-600">{task.topic}</td>
                    <td className="px-4 py-4">{task.plannedHours}h</td>
                    <td className="px-4 py-4">{task.actualHours}h</td>
                    <td className="px-4 py-4">
                      <Badge tone={task.status === "In Progress" ? "amber" : "slate"}>{task.status}</Badge>
                    </td>
                    <td className="px-4 py-4">{task.confidenceBefore} → {task.confidenceAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Morning Check-in</h2>
            <div className="mt-4">
              <DataRow label="Energy" value="4 / 5" />
              <DataRow label="Focus" value="3 / 5" />
              <DataRow label="Motivation" value="4 / 5" />
              <DataRow label="Sleep" value="7.5h" />
              <DataRow label="Academic goal" value="Make Electric Fields less fragile" />
              <DataRow label="Engineering goal" value="Document current sensor options" />
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Evening Reflection</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Total focused study time</p>
              <p>What went well?</p>
              <p>Biggest mistake and learning</p>
              <p>What should change tomorrow?</p>
              <p>Confidence about current progress: 1-5</p>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
