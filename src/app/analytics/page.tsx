import { StudyHoursChart, ScoreTrendChart } from "@/components/charts";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, Stat } from "@/components/ui";
import { errorEntries, exams, examPercentage, subjects } from "@/lib/data";

export default function AnalyticsPage() {
  const marksLost = errorEntries.reduce((sum, entry) => sum + entry.marksLost, 0);
  const unresolved = errorEntries.filter((entry) => !entry.resolved).length;
  const latestPhysics = exams.find((exam) => exam.subjectId === "physics");

  return (
    <AppShell>
      <PageHeader
        eyebrow="Internal Progress Estimate"
        title="Analytics"
        description="Progress observations based on study sessions, mock performance, topic confidence, and error recurrence. These are not official grade predictions."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <Stat label="Active subjects" value="3" detail="Economics retained" />
        </Card>
        <Card>
          <Stat label="Papers logged" value={`${exams.length}`} detail="Mocks and timed exercises" />
        </Card>
        <Card>
          <Stat label="Marks lost logged" value={`${marksLost}`} detail={`${unresolved} unresolved errors`} />
        </Card>
        <Card>
          <Stat label="Physics latest" value={`${latestPhysics ? examPercentage(latestPhysics) : 0}%`} detail="Target A" />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Study Hours by Subject</h2>
          <StudyHoursChart />
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Paper Score Trend</h2>
          <ScoreTrendChart />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {subjects.filter((subject) => subject.active).map((subject) => (
          <Card key={subject.id}>
            <h2 className="text-lg font-semibold">{subject.name}</h2>
            <p className="mt-3 text-3xl font-semibold">{subject.estimatedGrade}</p>
            <p className="mt-1 text-sm text-slate-500">Current estimate toward target {subject.targetGrade}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Smart Insights</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Physics scores have improved across the recent paper sequence.</p>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Mathematics latest paper is 78%, within range for A but still below A* boundary.</p>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Electric Fields has repeated errors and should be the next tutor discussion.</p>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">One completed paper still needs full error analysis before it counts as complete.</p>
        </div>
      </Card>
    </AppShell>
  );
}
