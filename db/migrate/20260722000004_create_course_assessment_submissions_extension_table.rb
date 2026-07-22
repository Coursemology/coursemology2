# frozen_string_literal: true

# Phase 1b step: extracts the course-coupled columns off course_assessment_attempts into their own
# small table, reusing the name `course_assessment_submissions` that Phase 1a's table rename freed
# up. See docs/superpowers/specs/2026-07-22-attempt-base-record-design.md §4.
#
# Built under a temporary name and renamed at the end of this migration so that
# `course_assessment_submissions_tmp` never appears as a real historical name in schema.rb — only
# the final `course_assessment_submissions` does, now denoting a different (small) table than it
# did pre-Phase-1a.
class CreateCourseAssessmentSubmissionsExtensionTable < ActiveRecord::Migration[7.2]
  def up
    create_table :course_assessment_submissions_tmp, id: :serial do |t|
      t.integer  :attempt_id, null: false
      t.integer  :publisher_id
      t.string   :session_id, limit: 255
      t.datetime :last_graded_time, precision: nil
      t.timestamps precision: nil, null: false
    end

    add_index :course_assessment_submissions_tmp, :attempt_id, unique: true,
                                                               name: 'unique_course_assessment_submissions_attempt_id'
    add_foreign_key :course_assessment_submissions_tmp, :course_assessment_attempts,
                    column: :attempt_id, name: 'fk_course_assessment_submissions_attempt_id'
    add_foreign_key :course_assessment_submissions_tmp, :users, column: :publisher_id,
                                                                name: 'fk_course_assessment_submissions_publisher_id'

    # Row-touching backfill: one Submission row per pre-existing Attempt row. At this point in the
    # branch's history every Attempt IS a real course submission (previews land in Phase 2), so
    # this is a 1:1, no-filter copy.
    execute <<~SQL.squish
      INSERT INTO course_assessment_submissions_tmp
        (attempt_id, publisher_id, session_id, last_graded_time, created_at, updated_at)
      SELECT id, publisher_id, session_id, last_graded_time, created_at, updated_at
      FROM course_assessment_attempts
    SQL

    rename_table :course_assessment_submissions_tmp, :course_assessment_submissions
  end

  def down
    rename_table :course_assessment_submissions, :course_assessment_submissions_tmp
    drop_table :course_assessment_submissions_tmp
  end
end
