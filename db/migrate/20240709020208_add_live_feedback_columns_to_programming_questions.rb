class AddLiveFeedbackColumnsToProgrammingQuestions < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_question_programming, :live_feedback_enabled, :bool, null: false, default: false
    add_column :course_assessment_question_programming, :live_feedback_custom_prompt, :string, null: false, default: ''
  end
end
