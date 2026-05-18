class AddExternalIdToCourseUsers < ActiveRecord::Migration[7.2]
  def change
    add_column :course_users, :external_id, :string
  end
end
