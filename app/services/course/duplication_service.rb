# frozen_string_literal: true

# Provides a service object for duplicating courses
class Course::DuplicationService
  # Constructor for the duplication service object.
  #
  # @param [Course] current_course The course to duplicate.
  # @param [Date] new_course_start_date The start date of the duplicated course.
  def initialize(current_course)
    @current_course = current_course
  end

  def duplicate(new_course_start_date)
    # fill this in
    true
  end
end
