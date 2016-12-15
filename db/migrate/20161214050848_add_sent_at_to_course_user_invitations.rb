class AddSentAtToCourseUserInvitations < ActiveRecord::Migration
  def change
    add_column :course_user_invitations, :sent_at, :datetime
  end
end
