import { createEventAction } from "@/actions/event-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";
import { getEvents } from "@/lib/repositories/events";

const prompts = [
  ["built", "What was being built?"],
  ["problemSolved", "What problem does it solve?"],
  ["technology", "What technology enables it?"],
  ["businessModel", "What is the business model?"],
  ["surprised", "What surprised me?"],
  ["furtherResearch", "What would I research further?"],
];

export default async function EventsPage() {
  const events = await getEvents();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Conf/Events"
        title="Conf/Events"
        description="Editable conference, meetup, university, and event log with structured reflections."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <Card>
          <h2 className="text-lg font-semibold">Add Event</h2>
          <form action={createEventAction} className="mt-4 space-y-3">
            <input name="eventName" placeholder="Event name" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input name="eventDate" type="date" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <input name="venue" placeholder="Venue" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <input name="topic" placeholder="Topic" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="speakers" placeholder="Speakers" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="peopleMet" placeholder="People met" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <input name="company" placeholder="Company/startup" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <textarea name="notes" placeholder="Notes" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <div className="grid gap-3">
              {prompts.map(([name, label]) => (
                <textarea
                  key={name}
                  name={name}
                  placeholder={label}
                  className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input name="publishToPortfolio" type="checkbox" />
              Publish to portfolio
            </label>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save event</button>
          </form>
        </Card>

        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Content Outline</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {prompts.map(([, prompt]) => (
                <div key={prompt} className="rounded-lg border border-slate-200 p-4 text-sm font-medium">
                  {prompt}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold">Saved Conf/Events</h2>
            <div className="mt-4 space-y-3">
              {events.length ? events.map((event) => (
                <div key={event.id} className="rounded-lg border border-slate-200 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{event.eventName}</p>
                      <p className="mt-1 text-sm text-slate-500">{event.eventDate || "No date"} · {event.venue || "No venue"}</p>
                    </div>
                    <Badge tone={event.publishToPortfolio ? "green" : "slate"}>
                      {event.publishToPortfolio ? "Portfolio" : "Private"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{event.notes || event.topic || "No notes yet."}</p>
                  {event.reflection ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {prompts.map(([key, label]) => (
                        <div key={key} className="rounded-md bg-slate-50 p-3 text-xs text-slate-600">
                          <span className="font-medium text-slate-900">{label}</span>
                          <p className="mt-1">{event.reflection?.[key] || "Not answered"}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              )) : (
                <p className="rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">No conferences or events saved yet.</p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
