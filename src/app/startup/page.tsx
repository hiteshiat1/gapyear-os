import { AppShell } from "@/components/app-shell";
import { Card, DataRow, PageHeader } from "@/components/ui";

export default function StartupPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="V2"
        title="Hyderabad Startup Experience"
        description="Track observation, problem discovery, build work, testing, and presentation evidence from the EV/drone startup period."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Experience Setup</h2>
          <div className="mt-4">
            <DataRow label="Company" value="EV / drone manufacturing startup" />
            <DataRow label="Duration" value="1-2 months" />
            <DataRow label="Primary objective" value="Learn systems, identify a real problem, build one useful prototype" />
            <DataRow label="Daily rule" value="A-level work continues during placement" />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Weekly Phases</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-700">
            <p><strong>Weeks 1-2:</strong> Observe EV architecture, batteries, BMS, controllers, drones, manufacturing, testing.</p>
            <p><strong>Weeks 3-4:</strong> Interview engineers and log wasted time, failures, manual work, cost and customer pain.</p>
            <p><strong>Weeks 5-7:</strong> Select one problem, prototype, test, fail, iterate.</p>
            <p><strong>Week 8:</strong> Present problem, evidence, prototype, result, business value, next steps.</p>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
