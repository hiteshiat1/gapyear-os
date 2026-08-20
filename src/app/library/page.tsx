import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";

export default function LibraryPage() {
  return (
    <AppShell>
      <PageHeader
        eyebrow="Learning"
        title="Learning Library"
        description="Save articles, videos, papers, courses, GitHub repositories, podcasts, and conference notes with a short takeaway."
      />
      <Card>
        <div className="grid gap-3 md:grid-cols-3">
          {["A-level resource", "Article", "Course", "YouTube video", "Book", "GitHub repository"].map((item) => (
            <div key={item} className="rounded-lg border border-slate-200 p-4 text-sm font-medium">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
