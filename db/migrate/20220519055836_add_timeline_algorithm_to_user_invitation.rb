class AddTimelineAlgorithmToUserInvitation < ActiveRecord::Migration[6.0]
  def change
    add_column :course_user_invitations, :timeline_algorithm, :integer
  end
end
