class AddSkipGradingToMrq < ActiveRecord::Migration[6.0]
  def change
    add_column :course_assessment_question_multiple_responses, :skip_grading, :boolean, default: false
  end
end
