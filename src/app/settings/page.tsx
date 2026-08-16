import { AppShell } from "@/components/app-shell";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/repositories/profiles";
import { isSupabaseConfigured, useMockData } from "@/lib/supabase/config";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  return (
    <AppShell>
      <PageHeader
        title="Settings"
        description="Configuration for academic rules, authentication, public portfolio visibility, and later mentor/tutor/parent accounts."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold">Academic Rules</h2>
          <div className="mt-4">
            <DataRow label="Daily academic target" value="6 focused hours" />
            <DataRow label="Travel/startup rule" value="Academic work still happens" />
            <DataRow label="Mock rule" value="Every mock generates error review" />
            <DataRow label="Mastery rule" value="80%+ accuracy, later test success, confidence 4/5+" />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Backend</h2>
          <div className="mt-4">
            <DataRow label="Supabase client" value={isSupabaseConfigured ? "Configured" : "Needs env vars"} />
            <DataRow label="Mock mode" value={useMockData ? "Enabled" : "Disabled"} />
            <DataRow label="Auth methods" value="Email/password and Google planned" />
            <DataRow label="Main user" value={profile?.fullName ?? "Student"} />
            <DataRow label="Future roles" value="Mentor, Tutor, Parent" />
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Import / Export</h2>
          <div className="mt-4">
            <DataRow label="Excel import" value="Use /settings/import" />
            <DataRow label="Excel export" value="Server route prepared after data is configured" />
            <DataRow label="Idempotency" value="source file, sheet, row key" />
            <DataRow label="Google Sheets" value="Use XLSX export/import, no two-way sync in V1" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
