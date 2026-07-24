# frozen_string_literal: true

# Extracts the course-coupled columns of the submission into their own
# small extension table WITHOUT renaming the base table. `Course::Assessment::Attempt` maps onto the
# existing `course_assessment_submissions` (the base) via `self.table_name`; `Submission` maps onto
# this new table.
#
# Purely additive: no DDL touches `course_assessment_submissions` (only READ for the backfill), so a
# rolling deploy's still-old worker is completely undisturbed. Reversible via `drop_table`.
#
# The course-coupled columns are deliberately left ALSO on the base table for now (duplicated) so the
# ~24 raw-SQL sites that read them keep working; a later cleanup migration drops them from the base.
class CreateCourseAssessmentSubmissionDetails < ActiveRecord::Migration[7.2]
  # Non-transactional so each backfill batch commits on its own — a production-sized
  # `course_assessment_submissions` must never ride in one giant transaction (long lock, WAL spike,
  # statement_timeout). The trade-off is that `up` is no longer atomic, so every step below is made
  # individually idempotent (`if_not_exists` + `WHERE NOT EXISTS`) and the whole migration is safe to
  # re-run after a partial failure.
  disable_ddl_transaction!

  BACKFILL_BATCH_SIZE = 5_000

  def up
    create_table :course_assessment_submission_details, id: :serial, if_not_exists: true do |t|
      t.integer  :attempt_id, null: false
      t.integer  :publisher_id
      t.string   :session_id, limit: 255
      t.datetime :last_graded_time, precision: nil
      t.timestamps precision: nil, null: false
    end

    add_index :course_assessment_submission_details, :attempt_id, unique: true, if_not_exists: true,
              name: 'unique_course_assessment_submission_details_attempt_id'
    add_foreign_key :course_assessment_submission_details, :course_assessment_submissions, if_not_exists: true,
                    column: :attempt_id, name: 'fk_course_assessment_submission_details_attempt_id'
    add_foreign_key :course_assessment_submission_details, :users, if_not_exists: true,
                    column: :publisher_id, name: 'fk_course_assessment_submission_details_publisher_id'

    backfill_details
  end

  def down
    drop_table :course_assessment_submission_details, if_exists: true
  end

  private

  # One extension row per existing base row, copied 1:1 (every base row is a real submission — preview
  # attempts don't exist yet). `WHERE NOT EXISTS` skips rows already backfilled, so this both fills a
  # fresh table and reconciles a partially-filled one; batched + looped so no single statement scans
  # the whole base table. Mirrors `rake db:backfill_submission_details`, which reruns this after the
  # rolling deploy fully cuts over.
  def backfill_details
    loop do
      inserted = execute(<<~SQL.squish).cmd_tuples
        INSERT INTO course_assessment_submission_details
          (attempt_id, publisher_id, session_id, last_graded_time, created_at, updated_at)
        SELECT s.id, s.publisher_id, s.session_id, s.last_graded_time, s.created_at, s.updated_at
        FROM course_assessment_submissions s
        WHERE NOT EXISTS (
          SELECT 1 FROM course_assessment_submission_details d WHERE d.attempt_id = s.id
        )
        ORDER BY s.id
        LIMIT #{BACKFILL_BATCH_SIZE}
      SQL
      break if inserted == 0
    end
  end
end
