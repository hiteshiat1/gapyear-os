import { StudyHoursChart, ScoreTrendChart } from "@/components/charts";
import { AppShell } from "@/components/app-shell";
import { Card, PageHeader, Stat } from "@/components/ui";
import { examPercentage, lastAverage } from "@/lib/analytics/calculations";
import { getScoreChartData, getStudyChartData } from "@/lib/repositories/analytics";
import { getExamErrors } from "@/lib/repositories/errors";
import { getExams } from "@/lib/repositories/exams";
import { getSubjects } from "@/lib/repositories/subjects";

export default async function AnalyticsPage() {
  const [subjects, exams, errorEntries, studyChart, scoreChart] = await Promise.all([
    getSubjects(),
    getExams(),
    getExamErrors(),
    getStudyChartData(),
    getScoreChartData(),
  ]);
  const marksLost = errorEntries.reduce((sum, entry) => sum + entry.marksLost, 0);
  const unresolved = errorEntries.filter((entry) => !entry.resolved).length;
  const latestExam = exams[0];

  return (
    <AppShell>
      <PageHeader
        eyebrow="Internal Progress Estimate"
        title="Analytics"
        description="Progress observations based on study sessions, mock performance, topic confidence, and error recurrence. These are not official grade predictions."
      />
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <Stat label="Active subjects" value={`${subjects.filter((subject) => subject.active).length}`} detail="Economics retained when inactive" />
        </Card>
        <Card>
          <Stat label="Papers logged" value={`${exams.length}`} detail={`Last 3 avg: ${lastAverage(exams, 3) ?? "-"}%`} />
        </Card>
        <Card>
          <Stat label="Marks lost logged" value={`${marksLost}`} detail={`${unresolved} unresolved errors`} />
        </Card>
        <Card>
          <Stat label="Latest paper" value={`${latestExam ? examPercentage(latestExam) : 0}%`} detail={latestExam?.paper ?? "No papers yet"} />
        </Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Study Hours by Subject</h2>
          {studyChart.length ? <StudyHoursChart data={studyChart} /> : <EmptyChartState />}
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Paper Score Trend</h2>
          {scoreChart.length ? <ScoreTrendChart data={scoreChart} /> : <EmptyChartState />}
        </Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {subjects.filter((subject) => subject.active).map((subject) => (
          <Card key={subject.id}>
            <h2 className="text-lg font-semibold">{subject.name}</h2>
            <p className="mt-3 text-3xl font-semibold">{subject.estimatedGrade ?? "Needs data"}</p>
            <p className="mt-1 text-sm text-slate-500">Current estimate toward target {subject.targetGrade ?? "unset"}</p>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Smart Insights</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Add study sessions to calculate consistency and weekly workload.</p>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Add grade boundaries per paper to calculate marks from target accurately.</p>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Repeated unresolved topic errors are flagged after 3+ occurrences or across multiple exams.</p>
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-700">Paper cycles stay incomplete until error review and corrections are complete.</p>
        </div>
      </Card>
    </AppShell>
  );
}

function EmptyChartState() {
  return (
    <div className="mt-4 flex h-72 items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm text-slate-500">
      No data yet.
    </div>
  );
}
