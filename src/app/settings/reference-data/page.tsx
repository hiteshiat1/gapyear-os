import { seedReferenceDataAction } from "@/actions/reference-actions";
import { AppShell } from "@/components/app-shell";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";

export default async function ReferenceDataSettingsPage() {
  const diagnostics = await getReferenceDiagnostics().catch(() => null);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Reference Data"
        description="Diagnostics for canonical A-Level subjects, exam boards, specifications, grades, and onboarding reference records."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Reference Import</h2>
          <p className="mt-2 text-sm text-slate-500">
            The import is idempotent and uses stable board codes, subject slugs, specification codes, and option codes.
          </p>
          <form action={seedReferenceDataAction} className="mt-4">
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
              Load / repair reference data
            </button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold">Diagnostics</h2>
          {diagnostics ? (
            <div className="mt-4">
              <DataRow label="Total subjects" value={diagnostics.totalSubjects} />
              <DataRow label="Exam boards" value={diagnostics.boards} />
              <DataRow label="AQA offerings" value={diagnostics.aqaOfferings} />
              <DataRow label="Edexcel offerings" value={diagnostics.edexcelOfferings} />
              <DataRow label="Specifications" value={diagnostics.specifications} />
              <DataRow label="Specification options" value={diagnostics.options} />
              <DataRow label="Full-topic specifications" value={diagnostics.fullTopicSpecifications} />
              <DataRow label="Coming-soon specifications" value={diagnostics.comingSoonSpecifications} />
              <DataRow label="Subjects with no verified offering" value={diagnostics.subjectsWithNoVerifiedBoardOffering} />
              <DataRow label="Duplicate board/spec codes" value={diagnostics.duplicateSpecificationCodes} />
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Reference tables are not available yet. Run the migration and load the reference data.
            </p>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
