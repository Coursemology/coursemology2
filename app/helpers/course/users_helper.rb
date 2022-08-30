# frozen_string_literal: true
module Course::UsersHelper
  # Returns a hash that maps +User+ ids to their +CourseUser+ in a given +course_id+
  #
  # @param [Course] course_id The ID of the course
  # @return [Hash]
  def preload_course_users_hash(course)
    course.course_users.to_h { |course_user| [course_user.user_id, course_user] }
  end
end
