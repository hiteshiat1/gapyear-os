import { seedReferenceDataAction } from "@/actions/reference-actions";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";

export default async function AdminDiagnosticsPage() {
  const { data: diagnostics, error } = await getReferenceDiagnostics();

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Diagnostics"
        description="Load or repair the base reference catalogue (exam boards, subjects, grade scales)."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Reference Import</h2>
          <p className="mt-2 text-sm text-slate-500">Idempotent. Safe to re-run.</p>
          <form action={seedReferenceDataAction} className="mt-4">
            <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
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
              Reference tables are not available yet. Run the migration and load reference data.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
