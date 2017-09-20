# frozen_string_literal: true
class Course::EnrolRequest < ApplicationRecord
  validate :validate_user_not_in_course, on: :create

  belongs_to :course, inverse_of: :enrol_requests
  belongs_to :user, inverse_of: :course_enrol_requests

  private

  # Ensure that there are no enrol requests by users in the course.
  def validate_user_not_in_course
    errors.add(:base, :user_in_course) unless course.course_users.where(user: user).blank?
  end
end
