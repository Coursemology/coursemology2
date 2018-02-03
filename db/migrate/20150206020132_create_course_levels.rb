# frozen_string_literal: true
class CreateCourseLevels < ActiveRecord::Migration[4.2]
  def change
    create_table :course_levels do |t|
      t.references :course,                   null: false
      t.integer :experience_points_threshold, null: false

      t.timestamps null: false
    end
  end
end
