class AddDeletedColumnInCourseUser < ActiveRecord::Migration[7.0]
  def change
    add_column :course_users, :deleted_at, :datetime
  end  
end
