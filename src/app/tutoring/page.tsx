import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";

export default function TutoringPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="V2"
        title="Tutoring"
        description="Tutor sessions, open questions, homework, and weekly tutor report will connect directly to weak topics and error recurrence."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Next Session</h2>
          <div className="mt-4">
            <DataRow label="Subject" value="Physics" />
            <DataRow label="When" value="Tuesday 17:00" />
            <DataRow label="Focus" value="Electric Fields and induction" />
            <DataRow label="Confidence before" value="2 / 5" />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Questions for Tutor</h2>
          <div className="mt-4 space-y-3">
            {["Why is electric potential scalar when field strength is vector?", "How should I structure six-mark explanation questions?", "Which induction questions should I retest next week?"].map((question) => (
              <div key={question} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm">{question}</p>
                <Badge tone="amber">Unanswered</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
