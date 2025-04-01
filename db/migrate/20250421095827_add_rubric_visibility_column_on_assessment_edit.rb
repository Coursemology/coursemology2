# frozen_string_literal: true
class AddRubricVisibilityColumnOnAssessmentEdit < ActiveRecord::Migration[7.2]
  def change
    add_column :course_assessments, :show_rubric_to_students, :boolean, null: true
  end
end
