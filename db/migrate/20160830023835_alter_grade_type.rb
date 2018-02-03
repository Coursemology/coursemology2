class AlterGradeType < ActiveRecord::Migration[4.2]
  def change
    change_column :course_assessment_answers, :grade, :decimal, precision: 4, scale: 1
    change_column :course_assessment_questions, :maximum_grade, :decimal, precision: 4, scale: 1
    change_column :course_assessment_question_text_response_solutions, :grade, :decimal,
                  precision: 4, scale: 1
  end
end
