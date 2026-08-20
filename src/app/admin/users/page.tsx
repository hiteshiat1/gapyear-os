import { updateUserRoleAction } from "@/actions/admin-actions";
import { Badge, Card, PageHeader } from "@/components/ui";
import { listAllProfiles } from "@/lib/repositories/profiles";

const ROLES = ["student", "parent", "tutor", "mentor", "admin"] as const;

export default async function AdminUsersPage() {
  const profiles = await listAllProfiles();

  return (
    <>
      <PageHeader eyebrow="Global Admin" title="Users" description="Manage user roles." />
      <Card>
        <div className="space-y-3">
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
                  <select name="role" defaultValue={row.role} className="rounded-md border border-slate-300 px-2 py-1.5 text-sm">
                    {ROLES.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium">Save</button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
