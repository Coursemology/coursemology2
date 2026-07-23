# frozen_string_literal: true

# Step 1 of the Attempt base-record migration
# (docs/superpowers/specs/2026-07-22-attempt-base-record-design.md).
#
# `course_assessment_submissions` is already mostly the attempts table — seven of its eleven
# columns are attempt-level. Rather than create a new base table and remap the largest tables in
# the schema, we rename this one into the base role; Phase 1b extracts the small course-coupled
# part back out under the old name.
#
# `rename_table` is metadata-only in PostgreSQL. Every index and foreign key follows automatically,
# including the inbound ones from course_assessment_answers, submission_questions,
# submission_logs, and question_bundle_assignments.
class RenameCourseAssessmentSubmissionsToAttempts < ActiveRecord::Migration[7.2]
  def change
    rename_table :course_assessment_submissions, :course_assessment_attempts
  end
end
