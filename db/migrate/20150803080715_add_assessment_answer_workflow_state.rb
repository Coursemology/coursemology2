# frozen_string_literal: true
class AddAssessmentAnswerWorkflowState < ActiveRecord::Migration[4.2]
  def change
    add_column :course_assessment_answers, :workflow_state, :string, null: false
  end
end
