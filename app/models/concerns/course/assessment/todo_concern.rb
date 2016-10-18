# frozen_string_literal: true
module Course::Assessment::TodoConcern
  extend ActiveSupport::Concern

  def can_user_start?(user)
    course_user = user.course_users.find_by(course: course)
    conditions_satisfied_by?(course_user)
  end
end
