class ChangeLengthOfInvitationKey < ActiveRecord::Migration
  def change
    change_column :course_user_invitations, :invitation_key, :string, limit: 32
  end
end
