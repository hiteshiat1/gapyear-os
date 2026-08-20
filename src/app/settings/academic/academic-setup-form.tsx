"use client";

import { useState } from "react";
import { updateAcademicSetupAction, removeAcademicSubjectAction } from "@/actions/academic-settings-actions";
import { ReferenceSubjectSelector } from "@/app/onboarding/reference-subject-selector";
import type {
  GradeOption,
  ReferenceBoardOption,
  ReferenceComponentOption,
  ReferenceSpecificationOption,
  ReferenceSubjectOption,
} from "@/lib/repositories/reference-data";
import type { OnboardingSelectedSubject, StudentOnboardingProfile } from "@/lib/repositories/onboarding";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AcademicSetupForm({
  profile,
  selectedSubjects,
  referenceSubjects,
  boards,
  specifications,
  options,
  grades,
}: {
  profile: StudentOnboardingProfile | null;
  selectedSubjects: OnboardingSelectedSubject[];
  referenceSubjects: ReferenceSubjectOption[];
  boards: ReferenceBoardOption[];
  specifications: ReferenceSpecificationOption[];
  options: ReferenceComponentOption[];
  grades: GradeOption[];
}) {
  const [isEditing, setIsEditing] = useState(false);

  if (!isEditing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-500">🔒 Locked</p>
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white"
          >
            Enable Editing
          </button>
        </div>
        <div className="mt-6 space-y-3">
          <Row label="First name" value={profile?.firstName ?? "Not set"} />
          <Row label="School / college" value={profile?.schoolCollege ?? "Not set"} />
          <Row label="Stage" value={profile?.stage ?? "Not set"} />
          {selectedSubjects.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-3">
              <div>
                <p className="font-medium">{subject.subjectName}</p>
                <p className="text-sm text-slate-500">
                  {subject.boardName ?? "Not sure"} · Self {subject.selfGrade ?? "–"} · School {subject.schoolPredictedGrade ?? "–"} · Target {subject.targetGrade ?? "–"}
                </p>
              </div>
              <form
                action={removeAcademicSubjectAction}
                onSubmit={(event) => {
                  if (!confirm(`Remove ${subject.subjectName} from your active subjects? Existing assessments and progress history will be retained.`)) {
                    event.preventDefault();
                  }
                }}
              >
                <input type="hidden" name="studentSubjectId" value={subject.id} />
                <button type="submit" className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium">
                  Remove
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <form action={updateAcademicSetupAction} className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-emerald-700">🔓 Editing Enabled</p>
        <button type="button" onClick={() => setIsEditing(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
          Cancel Changes
        </button>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Changes to subjects or specifications can affect your syllabus, plans and analytics.
      </div>

      <section>
        <h2 className="text-lg font-semibold">Student Profile</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input name="firstName" placeholder="First name" defaultValue={profile?.firstName ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input name="schoolCollege" placeholder="School / college" defaultValue={profile?.schoolCollege ?? ""} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <select name="stage" defaultValue={profile?.stage ?? "Year 12"} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            {["Year 12", "Year 13", "Resit-Gap Year"].map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">A-Level Subjects</h2>
        <ReferenceSubjectSelector subjects={referenceSubjects} boards={boards} specifications={specifications} options={options} grades={grades} />
      </section>

      <section>
        <h2 className="text-lg font-semibold">Available Time</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="weekdayDefaultMinutes"
            type="number"
            min="0"
            step="15"
            placeholder="Weekday study minutes"
            defaultValue={profile?.weekdayStudyHours ? Math.round(profile.weekdayStudyHours * 60) : ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="weekendDefaultMinutes"
            type="number"
            min="0"
            step="15"
            placeholder="Weekend study minutes"
            defaultValue={profile?.weekendStudyHours ? Math.round(profile.weekendStudyHours * 60) : ""}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          {days.map((day) => (
            <label key={day} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
              <input
                name="lighterDays"
                type="checkbox"
                value={day}
                defaultChecked={profile?.lighterDays.includes(day)}
              />
              {day}
            </label>
          ))}
        </div>
      </section>

      <button type="submit" className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white">
        Save Changes
      </button>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
