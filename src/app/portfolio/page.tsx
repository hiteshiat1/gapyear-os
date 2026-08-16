import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Badge, Card } from "@/components/ui";
import { getProjects } from "@/lib/repositories/projects";

export default async function PortfolioPage() {
  const projects = await getProjects({ publicOnly: true });

  return (
    <main className="min-h-screen bg-white text-slate-950">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
            <ArrowLeft className="h-4 w-4" />
            Private OS
          </Link>
          <div className="mt-10 max-w-3xl">
            <p className="text-sm font-medium uppercase tracking-[0.16em] text-slate-500">Public Portfolio</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Gap-Year Portfolio</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Aspiring engineer using a structured gap year to strengthen academic foundations while gaining practical exposure to EVs, drones, robotics, startups, and engineering projects.
            </p>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
        {["Electrical Engineering", "EV Systems", "Drones and Robotics"].map((skill) => (
          <Card key={skill}>
            <h2 className="text-lg font-semibold">{skill}</h2>
            <p className="mt-2 text-sm text-slate-500">Evidence is shown only when explicitly published.</p>
          </Card>
        ))}
      </section>
      <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold tracking-tight">Engineering Projects</h2>
        <div className="mt-5 grid gap-6 lg:grid-cols-2">
          {projects.length ? projects.map((project) => (
            <Card key={project.title}>
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-lg font-semibold">{project.title}</h3>
                <Badge tone="blue">{project.status}</Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{project.problem}</p>
              <p className="mt-3 text-sm font-medium">{project.technologies.join(", ")}</p>
            </Card>
          )) : (
            <Card>
              <p className="font-medium">No public projects yet.</p>
              <p className="mt-2 text-sm text-slate-500">Private records stay hidden until explicitly published.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
