class RenameQuestionTypeToGradingScheme < ActiveRecord::Migration[4.2]
  def change
    rename_column :course_assessment_question_multiple_responses, :question_type, :grading_scheme
  end
end
