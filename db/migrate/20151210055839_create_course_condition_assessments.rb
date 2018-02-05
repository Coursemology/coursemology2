# frozen_string_literal: true
class CreateCourseConditionAssessments < ActiveRecord::Migration[4.2]
  def change
    create_table :course_condition_assessments do |t|
      t.references :assessment, null: false, foreign_key: { references: :course_assessments }
      t.float :minimum_grade_percentage
    end
  end
end
