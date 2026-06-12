# frozen_string_literal: true
class ChangeGradebookWeightToDecimal < ActiveRecord::Migration[7.1]
  def up
    change_column :course_assessment_tabs, :gradebook_weight, :decimal, precision: 5, scale: 2, null: false, default: 0
  end

  def down
    change_column :course_assessment_tabs, :gradebook_weight, :integer, null: false, default: 0
  end
end
