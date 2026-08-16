import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";

export default function EventsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="V3"
        title="NYC / Events"
        description="A lightweight event and networking log for conferences, university events, startup meetups, technology demonstrations, and founder conversations."
      />
      <Card>
        <div className="grid gap-4 md:grid-cols-2">
          {["What was being built?", "What problem does it solve?", "What technology enables it?", "What is the business model?", "What surprised me?", "What would I research further?"].map((prompt) => (
            <div key={prompt} className="rounded-lg border border-slate-200 p-4 text-sm font-medium">
              {prompt}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
