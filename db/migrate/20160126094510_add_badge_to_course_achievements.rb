# frozen_string_literal: true
class AddBadgeToCourseAchievements < ActiveRecord::Migration[4.2]
  def change
    add_column :course_achievements, :badge, :text
  end
end
