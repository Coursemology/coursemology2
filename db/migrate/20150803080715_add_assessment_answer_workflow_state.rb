class AddAssessmentAnswerWorkflowState < ActiveRecord::Migration
  def change
    add_column :course_assessment_answers, :workflow_state, :string, null: false
  end
end
