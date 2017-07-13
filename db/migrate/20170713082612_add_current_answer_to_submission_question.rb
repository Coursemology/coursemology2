class AddCurrentAnswerToSubmissionQuestion < ActiveRecord::Migration
  def change
    add_column :course_assessment_submission_questions, :current_answer_id, :integer,
               foreign_key: { references: :course_assessment_answers }
  end
end
