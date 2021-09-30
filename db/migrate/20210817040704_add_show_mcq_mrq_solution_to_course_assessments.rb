class AddShowMcqMrqSolutionToCourseAssessments < ActiveRecord::Migration[5.2]
  def change
    add_column :course_assessments, :show_mcq_mrq_solution, :boolean, default: true
  end
end
