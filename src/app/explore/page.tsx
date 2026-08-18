import { createCourseInterestAction, saveInterestProfileAction } from "@/actions/future-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { broadInterestOptions, getCourseInterests, getInterestProfile } from "@/lib/repositories/future";

export default async function ExplorePage() {
  const [interestProfile, courseInterests] = await Promise.all([
    getInterestProfile().catch(() => null),
    getCourseInterests().catch(() => []),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Explore"
        title="Interests And Course Possibilities"
        description="Record broad interests and possible courses without choosing one fixed future."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Broad Interests</h2>
          <form action={saveInterestProfileAction} className="mt-4 space-y-4">
            <div className="grid gap-2 sm:grid-cols-2">
              {broadInterestOptions.map((interest) => (
                <label key={interest} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                  <input
                    name="broadInterests"
                    type="checkbox"
                    value={interest}
                    defaultChecked={interestProfile?.broadInterests.includes(interest)}
                  />
                  {interest}
                </label>
              ))}
            </div>
            <textarea
              name="freeText"
              placeholder="Other interests or questions you want to explore"
              defaultValue={interestProfile?.freeText ?? ""}
              className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save interests</button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Add Course Interest</h2>
          <form action={createCourseInterestAction} className="mt-4 space-y-3">
            <input name="courseName" placeholder="Mechanical Engineering" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <select name="interestLevel" defaultValue="3" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm">
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>Interest {level}/5</option>
              ))}
            </select>
            <textarea name="reason" placeholder="Why this course is interesting" className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save course interest</button>
          </form>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courseInterests.length ? courseInterests.map((interest) => (
          <Card key={interest.id}>
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-lg font-semibold">{interest.courseName}</h2>
              <Badge tone="blue">{interest.interestLevel}/5</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">{interest.reason ?? "No reason added yet."}</p>
          </Card>
        )) : (
          <Card>
            <p className="text-sm text-slate-500">No course interests saved yet.</p>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
