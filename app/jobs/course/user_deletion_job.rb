# frozen_string_literal: true
class Course::UserDeletionJob < ApplicationJob
  protected

  def perform(course, course_user, current_user)
    ActsAsTenant.without_tenant do
      unless course_user.destroy
        course_user.update_attribute(:deleted_at, nil)
        Course::Mailer.
          course_user_deletion_failed_email(course, course_user, current_user).
          deliver_later
      end
    end
  end
end
