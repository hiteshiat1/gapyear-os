"use client";

import { useMemo, useState } from "react";
import type {
  GradeOption,
  ReferenceBoardOption,
  ReferenceComponentOption,
  ReferenceSpecificationOption,
  ReferenceSubjectOption,
} from "@/lib/repositories/reference-data";

type SubjectSelection = {
  subjectId: string;
  boardId: string;
  specificationId: string;
  confirmationStatus: "confirmed" | "needs_confirmation";
  selfGrade: string;
  schoolPredictedGrade: string;
  targetGrade: string;
  selectedOptionIds: string[];
};

export function ReferenceSubjectSelector({
  subjects,
  boards,
  specifications,
  options,
  grades,
}: {
  subjects: ReferenceSubjectOption[];
  boards: ReferenceBoardOption[];
  specifications: ReferenceSpecificationOption[];
  options: ReferenceComponentOption[];
  grades: GradeOption[];
}) {
  const [rows, setRows] = useState<SubjectSelection[]>([
    blankRow(),
    blankRow(),
    blankRow(),
    blankRow(),
  ]);
  const targetGrades = grades.filter((grade) => grade.isTargetSelectable);

  const selectedSubjects = new Set(rows.map((row) => row.subjectId).filter(Boolean));
  const offeredSubjectIds = new Set(boards.map((board) => board.subjectId));

  return (
    <div className="mt-4 space-y-4">
      {rows.map((row, index) => {
        const subject = subjects.find((item) => item.id === row.subjectId);
        const availableBoards = boards.filter((board) => board.subjectId === row.subjectId);
        const availableSpecs = specifications.filter(
          (spec) => spec.subjectId === row.subjectId && spec.examBoardId === row.boardId,
        );
        const selectedSpec = specifications.find((spec) => spec.id === row.specificationId);
        const specOptions = options.filter((option) => option.specificationId === row.specificationId);
        const duplicateSubject = row.subjectId && rows.some((item, itemIndex) => itemIndex !== index && item.subjectId === row.subjectId);

        return (
          <div key={index} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="font-medium">Subject {index + 1}</h3>
              {subject?.topicSupportStatus === "coming_soon" || selectedSpec?.topicSupportStatus === "coming_soon" ? (
                <span className="rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                  Topic tracking coming soon
                </span>
              ) : null}
            </div>

            <input type="hidden" name={`subject_${index}_name`} value={subject?.name ?? ""} />
            <input type="hidden" name={`subject_${index}_referenceSubjectId`} value={row.subjectId} />
            <input type="hidden" name={`subject_${index}_examBoardId`} value={row.boardId} />
            <input type="hidden" name={`subject_${index}_examBoardName`} value={availableBoards.find((board) => board.id === row.boardId)?.name ?? ""} />
            <input type="hidden" name={`subject_${index}_specificationId`} value={row.specificationId} />
            <input type="hidden" name={`subject_${index}_specificationCode`} value={selectedSpec?.specificationCode ?? ""} />
            <input type="hidden" name={`subject_${index}_topicSupportStatus`} value={selectedSpec?.topicSupportStatus ?? subject?.topicSupportStatus ?? "coming_soon"} />
            {specOptions
              .filter((option) => row.selectedOptionIds.includes(option.id))
              .map((option) => (
                <input key={option.id} type="hidden" name={`subject_${index}_optionNames`} value={option.name} />
              ))}

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Subject</label>
                <select
                  value={row.subjectId}
                  onChange={(event) => updateRow(index, { subjectId: event.target.value, boardId: "", specificationId: "", selectedOptionIds: [] })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Choose subject</option>
                  {subjects.map((item) => {
                    const offered = offeredSubjectIds.has(item.id);
                    const takenByAnotherRow = selectedSubjects.has(item.id) && item.id !== row.subjectId;
                    return (
                      <option key={item.id} value={item.id} disabled={!offered || takenByAnotherRow}>
                        {item.name}{!offered ? " (Coming soon)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Exam board</label>
                <select
                  value={row.boardId}
                  onChange={(event) => {
                    const nextBoardId = event.target.value;
                    const matchingSpecs = specifications.filter(
                      (spec) => spec.subjectId === row.subjectId && spec.examBoardId === nextBoardId,
                    );
                    updateRow(index, {
                      boardId: nextBoardId,
                      specificationId: matchingSpecs.length === 1 ? matchingSpecs[0].id : "",
                      selectedOptionIds: [],
                    });
                  }}
                  disabled={!row.subjectId}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Choose board</option>
                  {availableBoards.map((board) => (
                    <option key={board.id} value={board.id}>{board.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Specification</label>
                <select
                  value={row.specificationId}
                  onChange={(event) => updateRow(index, { specificationId: event.target.value, selectedOptionIds: [] })}
                  disabled={!row.boardId}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value="">Choose specification</option>
                  {availableSpecs.map((spec) => (
                    <option key={spec.id} value={spec.id}>{spec.specificationCode} · {spec.specificationName}</option>
                  ))}
                </select>
              </div>
            </div>

            {duplicateSubject ? <p className="mt-2 text-sm text-red-600">This subject is already selected.</p> : null}

            {selectedSpec ? (
              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-sm font-medium">{selectedSpec.specificationCode} · {selectedSpec.specificationName}</p>
                <div className="mt-2 flex gap-4 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`subject_${index}_confirmationStatus`}
                      value="confirmed"
                      checked={row.confirmationStatus === "confirmed"}
                      onChange={() => updateRow(index, { confirmationStatus: "confirmed" })}
                    />
                    Confirm
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`subject_${index}_confirmationStatus`}
                      value="needs_confirmation"
                      checked={row.confirmationStatus === "needs_confirmation"}
                      onChange={() => updateRow(index, { confirmationStatus: "needs_confirmation" })}
                    />
                    I&apos;m not sure
                  </label>
                </div>
              </div>
            ) : null}

            {specOptions.length ? (
              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {specOptions.map((option) => (
                  <label key={option.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm">
                    <input
                      type="checkbox"
                      name={`subject_${index}_optionIds`}
                      value={option.id}
                      checked={row.selectedOptionIds.includes(option.id)}
                      onChange={(event) => {
                        const selected = event.target.checked
                          ? [...row.selectedOptionIds, option.id]
                          : row.selectedOptionIds.filter((id) => id !== option.id);
                        updateRow(index, { selectedOptionIds: selected });
                      }}
                    />
                    {option.code} · {option.name}
                  </label>
                ))}
              </div>
            ) : null}

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <GradeSelect
                name={`subject_${index}_selfGrade`}
                value={row.selfGrade}
                label="Self grade"
                grades={grades}
                extraOptions={["Not sure"]}
                onChange={(selfGrade) => updateRow(index, { selfGrade })}
              />
              <GradeSelect
                name={`subject_${index}_schoolPredictedGrade`}
                value={row.schoolPredictedGrade}
                label="School prediction"
                grades={grades}
                extraOptions={["Not provided yet", "Not sure"]}
                onChange={(schoolPredictedGrade) => updateRow(index, { schoolPredictedGrade })}
              />
              <GradeSelect
                name={`subject_${index}_targetGrade`}
                value={row.targetGrade}
                label="Target grade"
                grades={targetGrades}
                extraOptions={["Not sure"]}
                onChange={(targetGrade) => updateRow(index, { targetGrade })}
              />
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => setRows((current) => [...current, blankRow()])}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium"
      >
        Add another subject
      </button>
    </div>
  );

  function updateRow(index: number, patch: Partial<SubjectSelection>) {
    setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));
  }
}

function GradeSelect({
  name,
  label,
  value,
  grades,
  extraOptions,
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  grades: GradeOption[];
  extraOptions: string[];
  onChange: (value: string) => void;
}) {
  const options = useMemo(() => [...extraOptions, ...grades.map((grade) => grade.grade)], [extraOptions, grades]);
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      <select
        name={name}
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      >
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function blankRow(): SubjectSelection {
  return {
    subjectId: "",
    boardId: "",
    specificationId: "",
    confirmationStatus: "needs_confirmation",
    selfGrade: "",
    schoolPredictedGrade: "Not provided yet",
    targetGrade: "",
    selectedOptionIds: [],
  };
}
