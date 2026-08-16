import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";

export default function UcasEvidencePage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="V3"
        title="UCAS Evidence"
        description="Collect strong evidence for engineering motivation without automatically writing a personal statement."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        {["Why do you want to study this subject?", "How have your qualifications prepared you?", "What have you done outside formal education to prepare?"].map((question) => (
          <Card key={question}>
            <h2 className="text-lg font-semibold">{question}</h2>
            <p className="mt-3 text-sm text-slate-600">
              Each entry should capture what happened, what Sachith personally did, what he learned, the engineering concept involved, and why it increased interest.
            </p>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
