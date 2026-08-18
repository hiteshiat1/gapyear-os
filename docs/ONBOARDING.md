# Onboarding

The corrected onboarding flow is reference-data driven.

## State Machine

1. Student profile
   - first name
   - school / college
   - stage: Year 12, Year 13, Resit-Gap Year

2. Subject selection
   - student selects from canonical `a_level_subjects`
   - duplicate subjects are blocked
   - no free-form subject entry

3. Exam board and specification
   - board dropdown is filtered by `board_subject_offerings`
   - specification dropdown is filtered by selected subject and board
   - if a specification is uncertain, save `specification_confirmation_status = needs_confirmation`

4. Specification options
   - only shown when `specification_options` exist
   - saved into `student_specification_options`

5. Grades
   - self grade
   - school / UCAS predicted grade
   - target grade
   - values come from `grade_scales`
   - `U` can exist for outcomes but is not target-selectable
   - `Not sure` and `Not provided yet` are UI null states

6. Study availability
   - weekday default minutes
   - weekend default minutes
   - lighter/rest days
   - no forced subject-level hour allocation

7. Completion
   - save `student_profiles`
   - save `student_subjects`
   - save options
   - create initial `grade_history`
   - save `study_availability`
   - initialise supported syllabus data
   - generate an initial weekly plan

## Validation

Server-side validation prevents:

- no subject selected
- duplicate subject selection
- invalid subject ID
- invalid board/subject combination
- invalid specification for selected subject/board
- invalid grade values
- invalid target grade values

## Incomplete States

Allowed:

- school prediction not provided yet
- student is not sure about board/specification
- subject selected where topic support is coming soon

Coming-soon subjects still support grades, assessment history, study planning, study sessions, and notes.
