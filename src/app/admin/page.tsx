import { redirect } from "next/navigation";
import { updateUserRoleAction } from "@/actions/admin-actions";
import { seedReferenceDataAction } from "@/actions/reference-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";
import { getCurrentProfile, listAllProfiles } from "@/lib/repositories/profiles";

const ROLES = ["student", "parent", "tutor", "mentor", "admin"] as const;

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (profile?.role !== "admin") {
    redirect("/");
  }

  const [diagnostics, profiles] = await Promise.all([
    getReferenceDiagnostics().catch(() => null),
    listAllProfiles(),
  ]);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Global Admin"
        title="Platform Administration"
        description="Manage canonical reference data and user roles across ALevels.io. Only visible to admins."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1fr]">
        <Card>
          <h2 className="text-lg font-semibold">Reference Data</h2>
          <p className="mt-2 text-sm text-slate-500">
            Loads canonical subjects, exam boards, specifications, options, papers, and grade scales from
            the reference catalogue. Idempotent and safe to re-run.
          </p>
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

      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Users</h2>
        <p className="mt-2 text-sm text-slate-500">
          Change a user&apos;s role. Admins can manage reference data and every user&apos;s role.
        </p>
        <div className="mt-4 space-y-3">
          {profiles.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">{row.fullName}</p>
                <p className="text-xs text-slate-500">{row.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={row.role === "admin" ? "green" : "slate"}>{row.role}</Badge>
                <form action={updateUserRoleAction} className="flex items-center gap-2">
                  <input type="hidden" name="userId" value={row.id} />
                  <select
                    name="role"
                    defaultValue={row.role}
                    className="rounded-md border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">
                    Save
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
