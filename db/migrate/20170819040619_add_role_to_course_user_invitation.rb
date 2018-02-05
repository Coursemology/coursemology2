class AddRoleToCourseUserInvitation < ActiveRecord::Migration[4.2]
  def change
    add_column :course_user_invitations, :role, :integer, default: 0, null: false
  end
end
