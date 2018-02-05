# frozen_string_literal: true
class CreateCourseConditionLevels < ActiveRecord::Migration[4.2]
  def change
    create_table :course_condition_levels do |t|
      t.integer :minimum_level, null: false
    end
  end
end
