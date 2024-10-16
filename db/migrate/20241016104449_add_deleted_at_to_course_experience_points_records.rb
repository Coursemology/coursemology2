class AddDeletedAtToCourseExperiencePointsRecords < ActiveRecord::Migration[7.2]
  def change
    add_column :course_experience_points_records, :deleted_at, :datetime
    add_index :course_experience_points_records, :deleted_at
  end
end
