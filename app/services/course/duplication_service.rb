# frozen_string_literal: true

# Provides a service object for duplicating courses
class Course::DuplicationService
  # Constructor for the duplication service object.
  #
  # @param [Course] current_course The current course.
  # @param [Hash] duplication_params A hash of duplication parameters.
  # @param [Array] all_objects All the objects in the course.
  # @param [Array] selected_objects The objects to duplicate.
  def initialize(current_course, duplication_params = {}, all_objects = [], selected_objects = [])
    @current_course = current_course
    @all_objects = all_objects.append(current_course)
    @selected_objects = selected_objects.append(current_course)
    @duplication_params = duplication_params
  end

  # Duplicate the course with the duplicator.
  # Do not just pass in @selected_objects or object parents could be set incorrectly.
  #
  # @return [Boolean] Whether the duplication succeeded.
  def duplicate
    new_course = duplicator.duplicate(@current_course)
    return new_course.save!
  end

  private

  # Create a new duplication object to actually perform the duplication.
  # Initialize with the set of objects to be excluded from duplication, and the amount of time
  # to shift objects in the new course.
  #
  # @return [Duplicator]
  def duplicator
    @duplicator ||= Duplicator.new(@all_objects - @selected_objects, time_shift)
  end

  # Calculate the amount of time the objects in the new course have to be shifted by
  #
  # @return [ActiveSupport::TimeWithZone]
  def time_shift
    # must be symbol key
    @duplication_params[:new_course_start_date] - @current_course.start_at
  end
end
