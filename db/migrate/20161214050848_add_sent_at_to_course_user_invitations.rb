class AddSentAtToCourseUserInvitations < ActiveRecord::Migration[4.2]
  def change
    add_column :course_user_invitations, :sent_at, :datetime
  end
end
