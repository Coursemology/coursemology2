# frozen_string_literal: true

# Provides a service object for duplicating courses
class Course::DuplicationService
  class << self
    # Constructor for the duplication service object.
    #
    # @param [Course] current_course The course to duplicate.
    # @param [Array] all_objects All the objects in the course.
    # @param [Array] selected_objects The objects to duplicate.
    # @param [Hash] options The options to be sent to the Duplicator object.
    # @option options [User] :current_user The user triggering the duplication.
    # @option options [String] :new_course_title The new course_title for the duplicated course.
    # @option options [DateTime] :new_course_start_date Start date for the duplicated course.
    # @return [Course] The duplicated course
    def duplicate_course(current_course, options = {}, all_objects = [], selected_objects = [])
      service = new(current_course, options, all_objects, selected_objects)
      service.duplicate_course
    end
  end

  def initialize(current_course, options = {}, all_objects = [], selected_objects = [])
    @current_course = current_course
    @all_objects = all_objects.append(current_course)
    @selected_objects = selected_objects.append(current_course)
    @options = options
  end

  # Duplicate the course with the duplicator.
  # Do not just pass in @selected_objects or object parents could be set incorrectly.
  #
  # @return [Course] The duplicated course
  def duplicate_course
    duplicator.duplicate(@current_course).tap do |new_course|
      notify_duplication_complete(new_course) if new_course.save
    end
  end

  private

  # Create a new duplication object to actually perform the duplication.
  # Initialize with the set of objects to be excluded from duplication, and the amount of time
  # to shift objects in the new course.
  #
  # @return [Duplicator]
  def duplicator
    @duplicator ||= begin
      # TODO: Include survey objects after survey duplication is implemented
      excluded_objects = @all_objects - @selected_objects | @current_course.surveys
      Duplicator.new(excluded_objects, duplicator_options)
    end
  end

  # Builds the hash of options to be sent to the duplicator. If options do not exist, set default
  # options.
  #
  # @return [Hash] A hash of options to be sent to the duplicator.
  def duplicator_options
    {}.tap do |options|
      options[:time_shift] = time_shift
      options[:new_course_title] = new_course_title
      options[:current_user] = current_user
    end
  end

  # Sends an email to current_user to notify that the duplication is complete.
  #
  # @param [Course] new_course The duplicated course
  def notify_duplication_complete(new_course)
    Course::Mailer.course_duplicated_email(@current_course, new_course, current_user).deliver_now
  end

  # Calculate the amount of time the objects in the new course have to be shifted by
  #
  # @return [Float]
  def time_shift
    return 0 unless @options[:new_course_start_date]
    Time.zone.parse(@options[:new_course_start_date]) - @current_course.start_at
  end

  # Returns the new course title, or sets the default course_title
  #
  # @return [String]
  def new_course_title
    @options[:new_course_title] || 'Duplicated'
  end

  # Returns the current_user of the duplication object, or sets it to the system user.
  #
  # @return [User]
  def current_user
    @options[:current_user] || User.system
  end
end
