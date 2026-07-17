# frozen_string_literal: true

class UpdateSubmissionQuestionAttemptableUniqueness < ActiveRecord::Migration[7.2]
  disable_ddl_transaction!

  INDEX_NAME = 'idx_course_assessment_submission_questions_on_sub_and_qn'

  def up
    remove_index :course_assessment_submission_questions, name: INDEX_NAME, algorithm: :concurrently
    add_index :course_assessment_submission_questions, [:attemptable_type, :submission_id, :question_id],
              unique: true, name: INDEX_NAME, algorithm: :concurrently
  end

  def down
    remove_index :course_assessment_submission_questions, name: INDEX_NAME, algorithm: :concurrently
    add_index :course_assessment_submission_questions, [:submission_id, :question_id],
              unique: true, name: INDEX_NAME, algorithm: :concurrently
  end
end
