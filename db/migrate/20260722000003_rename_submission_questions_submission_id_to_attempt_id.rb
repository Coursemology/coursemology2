# frozen_string_literal: true

# Step 3 of the Attempt base-record migration. Metadata-only; index and foreign key follow.
class RenameSubmissionQuestionsSubmissionIdToAttemptId < ActiveRecord::Migration[7.2]
  def change
    rename_column :course_assessment_submission_questions, :submission_id, :attempt_id
  end
end
