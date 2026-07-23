# frozen_string_literal: true

# Phase 1 (additive, Design C): extracts the course-coupled columns of the submission into their own
# small extension table WITHOUT renaming the base table. `Course::Assessment::Attempt` maps onto the
# existing `course_assessment_submissions` (the base) via `self.table_name`; `Submission` maps onto
# this new table. See docs/superpowers/plans/2026-07-23-attempt-base-record-additive-replan.md.
#
# Purely additive: no DDL touches `course_assessment_submissions` (only READ for the backfill), so a
# rolling deploy's still-old worker is completely undisturbed. Reversible via `drop_table`.
#
# The course-coupled columns are deliberately left ALSO on the base table for now (duplicated) so the
# ~24 raw-SQL sites that read them keep working; a later cleanup migration drops them from the base.
class CreateCourseAssessmentSubmissionDetails < ActiveRecord::Migration[7.2]
  def up
    create_table :course_assessment_submission_details, id: :serial do |t|
      t.integer  :attempt_id, null: false
      t.integer  :publisher_id
      t.string   :session_id, limit: 255
      t.datetime :last_graded_time, precision: nil
      t.timestamps precision: nil, null: false
    end

    add_index :course_assessment_submission_details, :attempt_id,
              unique: true, name: 'unique_course_assessment_submission_details_attempt_id'
    add_foreign_key :course_assessment_submission_details, :course_assessment_submissions,
                    column: :attempt_id, name: 'fk_course_assessment_submission_details_attempt_id'
    add_foreign_key :course_assessment_submission_details, :users,
                    column: :publisher_id, name: 'fk_course_assessment_submission_details_publisher_id'

    # Row-touching backfill: one extension row per existing base row. Every base row is a real
    # submission (previews are Phase 2), so this is a 1:1, no-filter copy. Batchable if the base
    # table is large; a single INSERT…SELECT is fine for the dev DB.
    execute <<~SQL.squish
      INSERT INTO course_assessment_submission_details
        (attempt_id, publisher_id, session_id, last_graded_time, created_at, updated_at)
      SELECT id, publisher_id, session_id, last_graded_time, created_at, updated_at
      FROM course_assessment_submissions
    SQL
  end

  def down
    drop_table :course_assessment_submission_details
  end
end
