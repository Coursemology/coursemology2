# frozen_string_literal: true

# Step 2 of the Attempt base-record migration. Metadata-only in PostgreSQL; the index and the
# foreign key to course_assessment_attempts both follow the rename automatically.
class RenameAnswersSubmissionIdToAttemptId < ActiveRecord::Migration[7.2]
  def change
    rename_column :course_assessment_answers, :submission_id, :attempt_id
  end
end
