# frozen_string_literal: true

# Provides a service object for duplicating courses
class Course::DuplicationService
  class << self
    # Constructor for the duplication service object.
    #
    # @param [Course] current_course The course to duplicate.
    # @param [User] current_user The user that initiated the duplication service.
    # @param [Hash] duplication_params A hash of duplication parameters.
    # @param [Array] all_objects All the objects in the course.
    # @param [Array] selected_objects The objects to duplicate.
    def duplicate(current_course, current_user, duplication_params = {},
                  all_objects = [], selected_objects = [])
      service = new(current_course, current_user, duplication_params, all_objects, selected_objects)
      service.duplicate
    end
  end

  def initialize(current_course, current_user,
                 duplication_params = {}, all_objects = [], selected_objects = [])
    @current_course = current_course
    @current_user = current_user
    @all_objects = all_objects.append(current_course)
    @selected_objects = selected_objects.append(current_course)
    @duplication_params = duplication_params
    @duplication_params[:new_course_start_date] = Time.zone.parse(
      duplication_params[:new_course_start_date]
    )
  end

  # Duplicate the course with the duplicator.
  # Do not just pass in @selected_objects or object parents could be set incorrectly.
  #
  # @return [Boolean] Whether the duplication succeeded.
  def duplicate
    @new_course = duplicator.duplicate(@current_course)
    @new_course.save
  end

  private

  # Create a new duplication object to actually perform the duplication.
  # Initialize with the set of objects to be excluded from duplication, and the amount of time
  # to shift objects in the new course.
  #
  # @return [Duplicator]
  def duplicator
    # TODO: Include survey objects after survey duplication is implemented
    excluded_objects = @all_objects - @selected_objects | @current_course.surveys
    @duplicator ||=
      Duplicator.new(excluded_objects, time_shift, new_course_title, @current_user)
  end

  # Calculate the amount of time the objects in the new course have to be shifted by
  #
  # @return [ActiveSupport::TimeWithZone]
  def time_shift
    # must be symbol key
    @duplication_params[:new_course_start_date] - @current_course.start_at
  end

  # Returns the new course title
  #
  # @return [String]
  def new_course_title
    @duplication_params[:new_course_title]
  end
end
