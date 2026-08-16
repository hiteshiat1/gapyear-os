import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { portfolioProjects } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="V2"
        title="Engineering Projects"
        description="Prefer one substantial project with real testing and reflection over several shallow builds."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        {portfolioProjects.map((project) => (
          <Card key={project.title}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold">{project.title}</h2>
              <Badge tone="blue">{project.status}</Badge>
            </div>
            <p className="mt-4 text-sm text-slate-600">{project.problem}</p>
            <p className="mt-3 text-sm font-medium">Technology: {project.tech}</p>
            <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">Next task: {project.next}</p>
            <div className="mt-4 text-sm text-slate-500">
              Workflow: Problem → Research → Requirements → Design → Prototype → Test → Failure → Iterate → Final Result → Reflection
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
