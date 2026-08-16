# Syllabus And Planner

## Source Of Truth

The app now stores official syllabus structure as repository-managed reference data in `src/data/syllabuses/`.

- Edexcel A Level Mathematics: `9MA0`
- Edexcel Further Mathematics: `9FM0` with option route `E0`, covering Core Pure 1, Core Pure 2, Further Statistics 1, and Further Mechanics 1 only
- AQA A Level Physics: `7408C`, covering Paper 1, Paper 2, Paper 3A skills, and Paper 3B Engineering Physics only

Reference sources used during implementation:

- Pearson Edexcel A level Mathematics specification page: https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html
- Pearson Edexcel A level Further Mathematics specification page: https://qualifications.pearson.com/en/qualifications/edexcel-a-levels/mathematics-2017.html
- AQA Physics 7408 specification page: https://www.aqa.org.uk/subjects/science/as-and-a-level/physics-7407-7408/specification

Excel import is not a syllabus source. Imported rows may remain as user data, but official syllabus topics are loaded from repository definitions with stable codes.

## Database Model

`syllabus_topics` stores reference/master rows:

- subject mapping
- stable syllabus code
- spec reference
- paper code and paper name
- hierarchy
- optional/active flags

`topic_progress` stores per-user state:

- status
- confidence
- accuracy
- priority
- revision/retest metadata
- tutor feedback flags

`topic_diagnostics` stores scored checks that update topic progress from actual marks.

`daily_tasks`, `exam_errors`, and `exams` now support links into syllabus/paper metadata.

## Setup

Run the Supabase migration:

```sql
supabase/migrations/20260816_syllabus_planner.sql
```

Then open:

```text
/settings/syllabus
```

Use `Load / repair syllabus`. The operation is idempotent:

- upserts syllabus reference topics by `subject_id, stable_code`
- repairs parent links
- creates missing `topic_progress` rows
- does not overwrite existing progress
- does not delete exams, errors, diagnostics, tasks, or history

## Daily Planner

The generator supports:

- Normal Day
- Mock Day
- Startup Day
- Conf/Event Day
- Light/Recovery Day
- Custom

Normal days preserve at least one academic hour each for Maths, Further Maths, and Physics. Generated tasks include:

- linked syllabus topic
- human-readable reason
- priority score
- source, such as `adaptive-planner` or `mock-followup`

Regenerating a day only archives unstarted generated tasks. Manual, completed, and in-progress tasks remain.

The Today page also includes `Generate week`, which creates the next seven daily plans using a default rotation:

- four Normal Days
- one Light/Recovery Day
- one Startup Day
- one Conf/Event Day

## Priority Rules

Priority score is calculated from:

- topic status
- diagnostic accuracy
- confidence
- unresolved linked errors
- marks lost
- tutor flag
- spaced-review age
- upcoming retest date
- blocked paper cycle

The highest scoring topics appear on the dashboard and syllabus page as tomorrow's priorities.
