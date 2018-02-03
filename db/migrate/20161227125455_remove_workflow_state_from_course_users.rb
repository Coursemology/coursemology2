class RemoveWorkflowStateFromCourseUsers < ActiveRecord::Migration[4.2]
  def up
    ActsAsTenant.without_tenant do
      CourseUser.where(workflow_state: ['invited', 'rejected']).destroy_all
      CourseUser.where(workflow_state: 'requested').includes(:user, :course).each do |course_user|
        Course::EnrolRequest.transaction do
          Course::EnrolRequest.create!(course: course_user.course,
                                       user: course_user.user,
                                       created_at: course_user.created_at)
          course_user.destroy!
        end
      end
    end

    remove_column :course_users, :workflow_state
    change_column :course_users, :user_id, :integer, null: false
  end
end
