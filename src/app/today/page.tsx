import {
  createDailyTaskAction,
  generateDailyPlanAction,
  generateWeeklyPlanAction,
  saveDailyPlanAction,
  updateDailyTaskStatusAction,
} from "@/actions/daily-plan-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getDailyPlan } from "@/lib/repositories/daily-plans";
import { todayIso } from "@/lib/repositories/common";
import { firstName, getCurrentProfile } from "@/lib/repositories/profiles";
import { getSubjects } from "@/lib/repositories/subjects";

export default async function TodayPage() {
  const [dailyPlan, subjects, profile] = await Promise.all([getDailyPlan(), getSubjects(), getCurrentProfile()]);
  const name = firstName(profile);
  const today = todayIso();
  const tasks = dailyPlan?.tasks ?? [];
  const plannedTotal = tasks.reduce((sum, task) => sum + (task.estimatedDuration ?? 0), 0);
  const actualTotal = tasks.reduce((sum, task) => sum + (task.actualDuration ?? 0), 0);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Daily Plan"
        title={`${name}'s Today`}
        description="Create a daily academic plan, track actual work, and keep the check-in/reflection short enough to use every day."
      />
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">Schedule</h2>
            <p className="text-sm text-slate-500">Planned {plannedTotal}h · Actual {actualTotal}h</p>
          </div>
          <form action={generateDailyPlanAction} className="mt-4 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4">
            <input type="hidden" name="planDate" value={dailyPlan?.planDate ?? today} />
            <label className="grid gap-1 text-sm">
              <span className="font-medium text-slate-700">Generate plan mode</span>
              <select name="mode" defaultValue="Normal Day" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                {["Normal Day", "Mock Day", "Startup Day", "Conf/Event Day", "Light/Recovery Day", "Custom"].map((mode) => (
                  <option key={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Regenerate today&apos;s plan</button>
            <p className="text-xs text-slate-500">
              Replaces only unstarted generated tasks. Manual, completed, and in-progress tasks stay intact.
            </p>
          </form>
          <form action={generateWeeklyPlanAction} className="mt-3 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 p-4">
            <input type="hidden" name="startDate" value={today} />
            <div>
              <p className="text-sm font-medium text-slate-700">Generate next 7 days</p>
              <p className="mt-1 text-xs text-slate-500">
                Uses normal weekdays, lighter recovery, Startup Exp, and Conf/Event modes.
              </p>
            </div>
            <button className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Generate week</button>
          </form>
          {dailyPlan ? (
            <>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Time</th>
                      <th className="px-4 py-3 font-medium">Task</th>
                      <th className="px-4 py-3 font-medium">Topic</th>
                      <th className="px-4 py-3 font-medium">Planned</th>
                      <th className="px-4 py-3 font-medium">Actual</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {tasks.map((task) => (
                      <tr key={task.id}>
                        <td className="px-4 py-4 font-medium">{task.startsAt ?? "--"}{task.endsAt ? `-${task.endsAt}` : ""}</td>
                        <td className="px-4 py-4">
                          <p className="font-medium">{task.task}</p>
                          {task.reason ? <p className="mt-1 text-xs text-slate-500">{task.reason}</p> : null}
                          {task.source ? <p className="mt-1 text-xs text-slate-400">Source: {task.source}</p> : null}
                        </td>
                        <td className="px-4 py-4 text-slate-600">
                          {task.syllabusTopicId ? (
                            <a href={`/topics/${task.syllabusTopicId}`} className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-2">
                              {task.topic ?? "Topic"}
                            </a>
                          ) : (
                            task.topic ?? "-"
                          )}
                          {task.priorityScore != null ? <p className="mt-1 text-xs text-slate-400">Priority {task.priorityScore}</p> : null}
                        </td>
                        <td className="px-4 py-4">{task.estimatedDuration ?? 0}h</td>
                        <td className="px-4 py-4">{task.actualDuration ?? 0}h</td>
                        <td className="px-4 py-4">
                          <Badge tone={task.status === "Complete" ? "green" : task.status === "In Progress" ? "amber" : "slate"}>{task.status}</Badge>
                        </td>
                        <td className="px-4 py-4">
                          <form action={updateDailyTaskStatusAction} className="flex gap-2">
                            <input type="hidden" name="id" value={task.id} />
                            <select name="status" defaultValue={task.status} className="rounded-md border border-slate-300 px-2 py-1 text-xs">
                              {["Planned", "In Progress", "Complete", "Missed", "Rescheduled"].map((status) => (
                                <option key={status}>{status}</option>
                              ))}
                            </select>
                            <button className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium">Save</button>
                          </form>
                        </td>
                      </tr>
                    ))}
                    {!tasks.length ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                          No tasks yet. Add the first study block below.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
              <form action={createDailyTaskAction} className="mt-5 grid gap-3 rounded-lg border border-slate-200 p-4 md:grid-cols-2">
                <input type="hidden" name="dailyPlanId" value={dailyPlan.id} />
                <input name="task" placeholder="Physics focused block" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="category" placeholder="Academic" required className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <select name="subjectId" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  <option value="">No subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                <input name="topic" placeholder="Topic" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="startsAt" type="time" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="endsAt" type="time" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="estimatedDuration" type="number" min="0" step="0.25" placeholder="Planned hours" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <select name="status" defaultValue="Planned" className="rounded-md border border-slate-300 px-3 py-2 text-sm">
                  {["Planned", "In Progress", "Complete", "Missed", "Rescheduled"].map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
                <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white md:col-span-2">Add task</button>
              </form>
            </>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-500">
              No plan exists for today. Save the check-in to create one.
            </p>
          )}
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">Morning Check-in</h2>
            <form action={saveDailyPlanAction} className="mt-4 space-y-3">
              <input type="hidden" name="planDate" value={dailyPlan?.planDate ?? today} />
              <div className="grid grid-cols-2 gap-3">
                <input name="energy" type="number" min="1" max="5" defaultValue={dailyPlan?.energy ?? ""} placeholder="Energy 1-5" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="focus" type="number" min="1" max="5" defaultValue={dailyPlan?.focus ?? ""} placeholder="Focus 1-5" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="motivation" type="number" min="1" max="5" defaultValue={dailyPlan?.motivation ?? ""} placeholder="Motivation 1-5" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
                <input name="sleepHours" type="number" min="0" step="0.25" defaultValue={dailyPlan?.sleepHours ?? ""} placeholder="Sleep hours" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </div>
              <textarea name="academicGoal" defaultValue={dailyPlan?.academicGoal ?? ""} placeholder="Today's main academic goal" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <textarea name="personalGoal" defaultValue={dailyPlan?.personalGoal ?? ""} placeholder="Today's personal/engineering goal" className="min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Save check-in</button>
            </form>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Current Check-in</h2>
            <div className="mt-4">
              <DataRow label="Energy" value={dailyPlan?.energy ? `${dailyPlan.energy} / 5` : "Not set"} />
              <DataRow label="Focus" value={dailyPlan?.focus ? `${dailyPlan.focus} / 5` : "Not set"} />
              <DataRow label="Motivation" value={dailyPlan?.motivation ? `${dailyPlan.motivation} / 5` : "Not set"} />
              <DataRow label="Sleep" value={dailyPlan?.sleepHours ? `${dailyPlan.sleepHours}h` : "Not set"} />
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
