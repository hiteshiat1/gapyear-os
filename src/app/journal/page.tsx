import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";

const prompts = [
  "Academic: what did I learn?",
  "Engineering: what technical concept did I encounter?",
  "Startup: what business or product lesson did I notice?",
  "Problem solving: what problem did I face and how did I approach it?",
  "Failure: what did not work?",
  "Reflection: what would I do differently?",
  "New question: what am I curious about now?",
];

export default function JournalPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="V2"
        title="Gap-Year Journal"
        description="A structured, fast journal for turning study, engineering, startup, travel, and networking experiences into evidence."
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-2">
          {prompts.map((prompt) => (
            <div key={prompt} className="rounded-lg border border-slate-200 p-4">
              <p className="font-medium">{prompt}</p>
              <p className="mt-2 text-sm text-slate-500">Short answer field in V2</p>
            </div>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {["Academic", "Maths", "Physics", "Engineering", "Startup", "EV", "Drone", "NYC", "Project"].map((tag) => (
            <Badge key={tag}>{tag}</Badge>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
