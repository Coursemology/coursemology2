class AddSuspendedToCourseUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :course_users, :is_suspended, :boolean, default: false, null: false
    add_column :courses, :suspension_message, :text, null: true
  end
end
