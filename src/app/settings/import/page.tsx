import { previewWorkbookAction } from "@/actions/import-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Card, PageHeader } from "@/components/ui";

type PreviewRow = {
  sheetName: string;
  supported: boolean;
  target: string | null;
  rows: number;
};

export default async function ImportPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string; error?: string }>;
}) {
  const params = await searchParams;
  const preview = parsePreview(params.preview);

  return (
    <AppShell>
      <PageHeader
        eyebrow="Excel Import"
        title="Import Workbook"
        description="Upload an .xlsx workbook to preview supported sheets before importing into Supabase. The database remains the source of truth."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_2fr]">
        <Card>
          <h2 className="text-lg font-semibold">Upload</h2>
          {params.error ? <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{params.error}</p> : null}
          <form action={previewWorkbookAction} className="mt-4 space-y-4">
            <input name="workbook" type="file" accept=".xlsx" required className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            <button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">Preview workbook</button>
          </form>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Sheet</th>
                  <th className="px-4 py-3 font-medium">Rows</th>
                  <th className="px-4 py-3 font-medium">Target</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((row) => (
                  <tr key={row.sheetName}>
                    <td className="px-4 py-4 font-medium">{row.sheetName}</td>
                    <td className="px-4 py-4">{row.rows}</td>
                    <td className="px-4 py-4">{row.target ?? "-"}</td>
                    <td className="px-4 py-4">
                      <Badge tone={row.supported ? "green" : "slate"}>{row.supported ? "Supported" : "Ignored"}</Badge>
                    </td>
                  </tr>
                ))}
                {!preview.length ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-slate-500">
                      Upload a workbook to preview sheet mappings.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-sm text-slate-500">
            Confirmed bulk upsert will use source file, sheet name, and row key to avoid duplicate imports.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}

function parsePreview(value?: string): PreviewRow[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
