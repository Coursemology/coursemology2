# frozen_string_literal: true

# Preloads CourseUsers for a collection of Users for a given Course.
class Course::CourseUserPreloadService
  # Preloads CourseUsers and returns a hash that maps a User to its CourseUsers for the
  # given course.
  #
  # @param [Array<User>|Array<Integer>] users Users or their ids
  # @param [Course] course
  # @return [Hash{User => CourseUser}] Hash that maps users to course_user
  def initialize(users, course)
    course_users = CourseUser.includes(:user, :course).where(user: users.uniq, course: course)
    @user_course_user_hash = course_users.map do |course_user|
      [course_user.user, course_user]
    end.to_h
  end

  # Finds the user's course_user for the given course.
  #
  # @param [User] The user to find a course_user for
  # @return [CourseUser|nil] The course_user, if found, else nil
  def course_user_for(user)
    @user_course_user_hash[user]
  end
end
