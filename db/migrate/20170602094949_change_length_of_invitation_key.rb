class ChangeLengthOfInvitationKey < ActiveRecord::Migration[4.2]
  def change
    change_column :course_user_invitations, :invitation_key, :string, limit: 32
  end
end
