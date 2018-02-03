class ChangeCourseAssessmentQuestionsTitleNullity < ActiveRecord::Migration[4.2]
  def change
    change_column_null :course_assessment_questions, :title, true
  end
end
