class ChangeDeafultValueOfAssessmentQuestionsWeight < ActiveRecord::Migration
  def change
    change_column_default(:course_assessment_questions, :weight, nil)
  end
end
