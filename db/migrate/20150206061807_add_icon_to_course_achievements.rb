class AddIconToCourseAchievements < ActiveRecord::Migration
  def self.up
    add_attachment :course_achievements, :icon
  end

  def self.down
    remove_attachment :course_achievements, :icon
  end
end
