class CreateCourseAssessmentQuestionScribings < ActiveRecord::Migration
  def change
    create_table :course_assessment_question_scribings do |t|
      t.timestamps null: false
      t.integer :attempt_limit
    end
  end
end
