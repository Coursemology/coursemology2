class ChangeCourseUserInvitations < ActiveRecord::Migration[4.2]
  def up
    add_column :course_user_invitations, :course_id, :integer
    add_column :course_user_invitations, :name, :string
    add_column :course_user_invitations, :email, :string, index: { case_sensitive: false }
    add_column :course_user_invitations, :confirmed_at, :datetime
    add_index :course_user_invitations, [:course_id, :email], unique: true

    Course::UserInvitation.find_each do |invitation|
      course_user = CourseUser.find(invitation.course_user_id)
      email = User::Email.find(invitation.user_email_id)
      invitation.update_columns(
        course_id: course_user.course_id,
        name: course_user.name,
        email: email.email,
        confirmed_at: course_user.workflow_state == 'approved' ? course_user.user.created_at : nil
      )
    end

    change_column :course_user_invitations, :course_id, :integer, null: false
    change_column :course_user_invitations, :name, :string, null: false
    change_column :course_user_invitations, :email, :string, null: false

    remove_column :course_user_invitations, :course_user_id
    remove_column :course_user_invitations, :user_email_id
  end
end
