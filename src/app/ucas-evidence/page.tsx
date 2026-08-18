import { createEvidenceLinkAction } from "@/actions/future-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getCareerFamilies, getCourseInterests, getEvidenceLinks, getUniversityChoices } from "@/lib/repositories/future";
import { getProjects } from "@/lib/repositories/projects";

const questions = [
  "Why do you want to study this course/subject?",
  "How have your qualifications/studies prepared you?",
  "What else have you done outside formal education, and why is it useful?",
];

export default async function UcasEvidencePage() {
  const [courseInterests, universityChoices, careerFamilies, projects, evidenceLinks] = await Promise.all([
    getCourseInterests().catch(() => []),
    getUniversityChoices().catch(() => []),
    getCareerFamilies(),
    getProjects().catch(() => []),
    getEvidenceLinks().catch(() => []),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="UCAS"
        title="UCAS Evidence"
        description="Organise confirmed evidence around the current three-question UCAS personal-statement format without inventing achievements."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Link Evidence</h2>
          <form action={createEvidenceLinkAction} className="mt-4 space-y-3">
            <select name="sourceType" defaultValue="project" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {["project", "work experience", "reading", "course", "competition", "conference", "volunteering", "leadership", "research", "extracurricular"].map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            <select name="sourceId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Optional existing evidence item</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <select name="courseInterestId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Optional course interest</option>
              {courseInterests.map((course) => (
                <option key={course.id} value={course.id}>{course.courseName}</option>
              ))}
            </select>
            <select name="universityChoiceId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Optional university choice</option>
              {universityChoices.map((choice) => (
                <option key={choice.id} value={choice.id}>{choice.university} · {choice.course}</option>
              ))}
            </select>
            <select name="careerFamilyId" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              <option value="">Optional career family</option>
              {careerFamilies.map((family) => (
                <option key={family.id} value={family.id}>{family.name}</option>
              ))}
            </select>
            <select name="ucasCategory" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {questions.map((question) => (
                <option key={question}>{question}</option>
              ))}
            </select>
            <input name="skills" placeholder="Skills evidenced, comma-separated" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <textarea
              name="reflectionStrength"
              placeholder="What I did, learned, and how it changed my thinking"
              className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save evidence link</button>
          </form>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {questions.map((question) => (
            <Card key={question}>
              <h2 className="text-lg font-semibold">{question}</h2>
              <p className="mt-3 text-sm text-slate-600">
                Strong evidence should say what happened, what the student personally did, what they learned, and why it matters.
              </p>
              <div className="mt-4 space-y-3">
                {evidenceLinks.filter((link) => link.ucasCategory === question).map((link) => (
                  <div key={link.id} className="rounded-lg border border-slate-200 p-3">
                    <Badge tone={link.reflectionStrength && link.reflectionStrength.length > 80 ? "green" : "amber"}>
                      {link.reflectionStrength && link.reflectionStrength.length > 80 ? "stronger reflection" : "needs detail"}
                    </Badge>
                    <p className="mt-2 text-sm text-slate-600">{link.reflectionStrength || "Add what you personally did and learned."}</p>
                    {link.skills.length ? <p className="mt-2 text-xs text-slate-500">Skills: {link.skills.join(", ")}</p> : null}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
