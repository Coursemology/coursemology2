class AddShowMcqAnswerToCourseAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :course_assessments, :show_mcq_answer, :boolean, default: true
  end
end
