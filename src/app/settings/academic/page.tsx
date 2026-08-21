import { AppShell } from "@/components/app-shell";
import { Card, PageHeader } from "@/components/ui";
import { getMyOnboardingSubjects, getStudentOnboardingProfile } from "@/lib/repositories/onboarding";
import {
  getBoardOfferings,
  getGradeOptions,
  getReferenceOptions,
  getReferenceSpecifications,
  getReferenceSubjects,
} from "@/lib/repositories/reference-data";
import { AcademicSetupForm } from "./academic-setup-form";

export default async function AcademicSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [
    { error },
    profile,
    selectedSubjects,
    referenceSubjectsResult,
    boardsResult,
    specificationsResult,
    optionsResult,
    grades,
  ] = await Promise.all([
    searchParams,
    getStudentOnboardingProfile().catch(() => null),
    getMyOnboardingSubjects(),
    getReferenceSubjects(),
    getBoardOfferings(),
    getReferenceSpecifications(),
    getReferenceOptions(),
    getGradeOptions(),
  ]);

  const referenceSubjects = referenceSubjectsResult.data;
  const boards = boardsResult.data;
  const specifications = specificationsResult.data;
  const options = optionsResult.data;
  const referenceDataError = referenceSubjectsResult.error ?? boardsResult.error ?? specificationsResult.error ?? optionsResult.error;

  return (
    <AppShell>
      <PageHeader
        eyebrow="Settings"
        title="Academic Setup"
        description="Your subjects, grades, and study availability. Locked by default — enable editing to make changes."
      />
      {error ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      ) : null}
      {referenceDataError ? (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Couldn&apos;t load subject reference data: {referenceDataError}</p>
        </div>
      ) : null}
      <Card>
        <AcademicSetupForm
          key={`${profile?.updatedAt ?? "new"}-${selectedSubjects.map((subject) => subject.id).join(",")}`}
          profile={profile}
          selectedSubjects={selectedSubjects}
          referenceSubjects={referenceSubjects}
          boards={boards}
          specifications={specifications}
          options={options}
          grades={grades}
        />
      </Card>
    </AppShell>
  );
}
