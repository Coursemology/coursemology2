class AddExternalIdToCourseUserInvitations < ActiveRecord::Migration[7.2]
  def change
    add_column :course_user_invitations, :external_id, :string
  end
end
