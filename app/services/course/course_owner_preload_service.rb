# frozen_string_literal: true

class Course::CourseOwnerPreloadService
  # Preloads course owners for a collection of courses.
  #
  # @param [Array<Integer>] course_ids
  # @return [Hash{course_id => Array<CourseUser>}] Hash that maps id to course_users
  def initialize(course_ids)
    @owners = CourseUser.owner.includes(:user).where(course_id: course_ids).group_by(&:course_id)
  end

  # Finds the course owners for the given course.
  #
  # @param [Integer] course_id
  # @return [Array<CourseUser>|nil] The course owners, if found, else nil
  def course_owners_for(course_id)
    @owners[course_id]
  end
end
