class AddSuspendedToCourses < ActiveRecord::Migration[7.2]
  def change
    rename_column :courses, :suspension_message, :user_suspension_message
    add_column :courses, :is_suspended, :boolean, default: false, null: false
    add_column :courses, :course_suspension_message, :text, null: true
  end
end
