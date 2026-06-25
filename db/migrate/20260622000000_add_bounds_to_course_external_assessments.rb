# frozen_string_literal: true
class AddBoundsToCourseExternalAssessments < ActiveRecord::Migration[7.2]
  def change
    add_column :course_external_assessments, :floor_at_zero, :boolean, null: false, default: true
    add_column :course_external_assessments, :cap_at_maximum, :boolean, null: false, default: true
  end
end
