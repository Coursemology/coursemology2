class ChangeCourseAssessmentQuestionsTitleNullity < ActiveRecord::Migration
  def change
    change_column_null :course_assessment_questions, :title, true
  end
end
