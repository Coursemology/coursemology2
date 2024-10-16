class AddDeletedAtToCourseUserAchievements < ActiveRecord::Migration[7.2]
  def change
    add_column :course_user_achievements, :deleted_at, :datetime
    add_index :course_user_achievements, :deleted_at
  end
end
