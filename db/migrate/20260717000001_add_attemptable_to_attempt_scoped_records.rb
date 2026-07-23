# frozen_string_literal: true

class AddAttemptableToAttemptScopedRecords < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  SUBMISSION_TYPE = 'Course::Assessment::Submission'

  def up
    add_attemptable(:course_assessment_answers)
    add_attemptable(:course_assessment_submission_questions)
  end

  def down
    remove_attemptable(:course_assessment_submission_questions)
    remove_attemptable(:course_assessment_answers)
  end

  private

  def add_attemptable(table)
    # Resolved migration shape (spec §5.1, 2026-07-16): defaulted NOT-NULL add. In PG 11+ this is
    # metadata-only — the default covers every existing row with no table rewrite and NO backfill,
    # even on course_assessment_answers. The default stays permanently: Rails always writes the
    # type through the association, and it is the safe value for any raw insert.
    unless column_exists?(table, :attemptable_type)
      add_column table, :attemptable_type, :string, null: false, default: SUBMISSION_TYPE
    end

    remove_foreign_key table, column: :submission_id
    add_index table, [:attemptable_type, :submission_id],
              name: "index_#{table}_on_attemptable", algorithm: :concurrently
  end

  def remove_attemptable(table)
    remove_index table, name: "index_#{table}_on_attemptable" if index_name_exists?(table, "index_#{table}_on_attemptable")
    add_foreign_key table, :course_assessment_submissions, column: :submission_id
    remove_column table, :attemptable_type
  end
end
