class RemoveQuestionAssessmentIndexFromCourseQuestionAssessments < ActiveRecord::Migration[6.0]
  def change
    remove_index :course_question_assessments, column: [:question_id, :assessment_id]
  end
end
