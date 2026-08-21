# Reference Data

Alevs.io now separates canonical A-Level reference data from student-owned selections.

## Source Hierarchy

1. Official AQA and Pearson Edexcel specification pages for board availability, specification codes, papers, and options.
2. GOV.UK / Ofqual subject requirements collection for regulated A-Level subject categories.
3. Save My Exams subject overview only as a secondary discovery/cross-check source.

Do not present third-party-derived data as official exam-board data.

## Schema

Reference/master tables:

- `exam_boards`
- `a_level_subjects`
- `board_subject_offerings`
- `specifications`
- `specification_options`
- `papers`
- `grade_scales`

Student-owned tables:

- `student_subjects`
- `student_specification_options`
- `grade_history`
- `study_availability`

The existing user-owned `subjects` table is still mirrored for compatibility with current planner screens. It is not the source of truth for canonical subjects.

## Updating Data

Reference records live in:

```text
src/data/reference/catalogue.ts
```

Run the idempotent import from:

```text
/settings/reference-data
```

Stable keys:

- exam board: `code`
- subject: `slug`
- specification: `exam_board_id + specification_code`
- option: `specification_id + code`
- paper: `specification_id + code`

## Adding A Subject

1. Add the subject to `referenceSubjects`.
2. Set `topicSupportStatus` to `full`, `coming_soon`, or `not_planned`.
3. Add verified board offerings only by adding official specifications.
4. Re-run `Load / repair reference data`.

## Topic Support

Initial full-topic target subjects:

- Mathematics
- Further Mathematics
- Biology
- Physics
- English Literature
- Chemistry
- Economics
- Computer Science

Subjects outside this list can still be selected. They show topic tracking as coming soon and remain usable for grades, assessments, study planning, and notes.

## Diagnostics

Use `/settings/reference-data` to check:

- total subjects
- AQA offerings
- Edexcel offerings
- specifications
- full-topic specifications
- coming-soon specifications
- subjects with no verified board offering
- duplicate board/specification codes

## Source Links

- GOV.UK Ofqual collection: https://www.gov.uk/government/collections/new-a-level-and-as-level-qualifications-requirements-and-guidance
- Pearson Edexcel catalogue: https://qualifications.pearson.com/en/qualifications/edexcel-a-levels.html
- AQA subjects: https://www.aqa.org.uk/subjects
- Save My Exams subject overview: https://www.savemyexams.com/learning-hub/a-level-choices/a-level-subjects-explained/
