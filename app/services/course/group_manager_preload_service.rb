# frozen_string_literal: true

# Allows querying of group managers of users in a given collection without generating N+1 queries.
class Course::GroupManagerPreloadService
  # Sets the collection of CourseUsers which `group_managers_of` will search from.
  # Assumes that GroupUsers and their Groups have been loaded for each CourseUser.
  #
  # @param [Array<CourseUser>] course_users
  def initialize(course_users)
    @course_users = course_users
  end

  # Returns all managers of the groups that the given CourseUser are a part of.
  # Assumes that GroupUsers and their Groups have been loaded for the given CourseUser.
  #
  # @param [CourseUser] course_user The given CourseUser
  # @return [Array<CourseUser>]
  def group_managers_of(course_user)
    course_user.groups.map do |group|
      group_managers_hash[group.id]
    end.flatten.compact.map(&:course_user).uniq
  end

  # @return [Boolean] True if none of the given course users are group managers
  def no_group_managers?
    group_managers_hash.empty?
  end

  private

  # Maps groups to their managers
  #
  # @return [Hash{Course::Group => Array<Course::GroupUser>}]
  def group_managers_hash
    @group_managers_hash ||=
      @course_users.map(&:group_users).flatten.select(&:manager?).group_by(&:group_id)
  end
end
