class AddDeletedAtToCoursePersonalTimes < ActiveRecord::Migration[7.2]
  def change
    add_column :course_personal_times, :deleted_at, :datetime
    add_index :course_personal_times, :deleted_at
  end
end
