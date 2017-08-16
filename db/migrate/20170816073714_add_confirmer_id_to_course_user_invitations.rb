class AddConfirmerIdToCourseUserInvitations < ActiveRecord::Migration
  def change
    add_column :course_user_invitations, :confirmer_id, :integer, foreign_key: { references: :users }
  end
end
