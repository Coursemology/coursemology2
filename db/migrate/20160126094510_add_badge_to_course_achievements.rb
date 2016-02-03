# frozen_string_literal: true
class AddBadgeToCourseAchievements < ActiveRecord::Migration
  def change
    add_column :course_achievements, :badge, :text
  end
end
