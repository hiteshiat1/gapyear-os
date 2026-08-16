import { AppShell } from "@/components/app-shell";
import { Card, DataRow, PageHeader } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function SettingsPage() {
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
            <DataRow label="Auth methods" value="Email/password and Google planned" />
            <DataRow label="Main user" value="Sachith" />
            <DataRow label="Future roles" value="Mentor, Tutor, Parent" />
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
