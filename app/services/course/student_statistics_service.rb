# frozen_string_literal: true

# Performs calculations for Student Statistics Pages.
class Course::StudentStatisticsService
  # Sets the collection of CourseUsers which `tutors_of` will search from. It is possible for
  # "tutors" not to be staff. Assumes that GroupUsers and their Groups have been included with
  # each CourseUser.
  #
  # @param [Array<CourseUser>] tutors
  def initialize(tutors)
    @tutors = tutors
  end

  # Returns all managers of the groups that the given CourseUser are a part of.
  # Assumes that GroupUsers and their Groups have been included with the given CourseUser.
  #
  # @param [CourseUser] course_user The given CoruseUser
  # @return [Array<CourseUser>]
  def tutors_of(course_user)
    course_user.groups.map do |group|
      @tutors.select do |tutor|
        tutor.group_users.select do |group_user|
          group_user.manager? && group_user.group_id == group.id
        end.present?
      end
    end.flatten.uniq
  end
end
