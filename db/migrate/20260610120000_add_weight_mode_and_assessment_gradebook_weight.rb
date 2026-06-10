# frozen_string_literal: true
class AddWeightModeAndAssessmentGradebookWeight < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessment_tabs, :weight_mode, :integer, null: false, default: 0
    add_column :course_assessments, :gradebook_weight, :decimal, precision: 5, scale: 2, null: true
  end
end
