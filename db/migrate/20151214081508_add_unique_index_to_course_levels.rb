# frozen_string_literal: true
class AddUniqueIndexToCourseLevels < ActiveRecord::Migration[4.2]
  def change
    add_index :course_levels,
              [:course_id, :experience_points_threshold],
              unique: true,
              name: 'index_experience_points_threshold_on_course_id'
  end
end
