class AddStdoutStderrToCourseAssessmentAnswerProgrammingAutoGrading < ActiveRecord::Migration
  def change
    add_column :course_assessment_answer_programming_auto_gradings, :stdout, :text
    add_column :course_assessment_answer_programming_auto_gradings, :stderr, :text
    add_column :course_assessment_answer_programming_auto_gradings, :exit_code, :integer
  end
end
