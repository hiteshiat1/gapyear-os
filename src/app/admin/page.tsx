import Link from "next/link";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getReferenceDiagnostics } from "@/lib/repositories/reference-data";
import { listAllProfiles } from "@/lib/repositories/profiles";

export default async function AdminOverviewPage() {
  const [{ data: diagnostics }, profiles] = await Promise.all([
    getReferenceDiagnostics(),
    listAllProfiles(),
  ]);

  const students = profiles.filter((profile) => profile.role === "student").length;
  const admins = profiles.filter((profile) => profile.role === "admin").length;

  return (
    <>
      <PageHeader
        eyebrow="Global Admin"
        title="Admin Overview"
        description="Manage subject visibility, syllabus provisioning, users, and canonical reference data."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><DataRow label="Total users" value={profiles.length} /></Card>
        <Card><DataRow label="Students" value={students} /></Card>
        <Card><DataRow label="Admins" value={admins} /></Card>
        <Card><DataRow label="Total subjects" value={diagnostics?.totalSubjects ?? 0} /></Card>
        <Card><DataRow label="AQA offerings" value={diagnostics?.aqaOfferings ?? 0} /></Card>
        <Card><DataRow label="Edexcel offerings" value={diagnostics?.edexcelOfferings ?? 0} /></Card>
        <Card><DataRow label="Full-topic specifications" value={diagnostics?.fullTopicSpecifications ?? 0} /></Card>
        <Card><DataRow label="Coming-soon specifications" value={diagnostics?.comingSoonSpecifications ?? 0} /></Card>
      </div>
      <Card className="mt-6">
        <h2 className="text-lg font-semibold">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/admin/subjects" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Manage Subjects</Link>
          <Link href="/admin/syllabuses" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Syllabus Status</Link>
          <Link href="/admin/users" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Manage Users</Link>
          <Link href="/admin/diagnostics" className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">Run Diagnostics</Link>
        </div>
      </Card>
    </>
  );
}
