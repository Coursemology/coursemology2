class ChangeDefaultValueOfAssessmentQuestionsWeight < ActiveRecord::Migration[4.2]
  def change
    change_column_default(:course_assessment_questions, :weight, nil)
  end
end
