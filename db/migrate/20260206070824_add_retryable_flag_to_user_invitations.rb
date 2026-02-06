class AddRetryableFlagToUserInvitations < ActiveRecord::Migration[7.2]
  def change
    add_column :course_user_invitations, :is_retryable, :boolean, default: true, null: false
    add_column :instance_user_invitations, :is_retryable, :boolean, default: true, null: false
  end
end
