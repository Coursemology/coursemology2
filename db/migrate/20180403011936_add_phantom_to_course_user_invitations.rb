class AddPhantomToCourseUserInvitations < ActiveRecord::Migration[5.1]
  def change
    add_column :course_user_invitations, :phantom, :boolean, default: false, null: false
  end
end
