# frozen_string_literal: true

# Service to provide a full duplication of a Course.
class Course::Duplication::CourseDuplicationService < Course::Duplication::BaseService
  class << self
    # Constructor for the course duplication service.
    #
    # @param [Course] current_course The course to duplicate.
    # @param [Hash] options The options to be sent to the Duplicator object.
    # @option options [User] :current_user (+User.system+) The user triggering the duplication.
    # @option options [String] :new_title ('Duplicated') The title for the duplicated course.
    # @option options [DateTime] :new_start_at Start date and time for the duplicated course.
    # @param [Array] all_objects All the objects in the course.
    # @param [Array] selected_objects The objects to duplicate.
    # @return [Course] The duplicated course
    def duplicate_course(current_course, options = {}, all_objects = [], selected_objects = [])
      excluded_objects = all_objects - selected_objects
      options[:excluded_objects] = excluded_objects
      options[:current_course] = current_course
      options[:time_shift] =
        if options[:new_start_at]
          Time.zone.parse(options[:new_start_at]) - current_course.start_at
        else
          0
        end
      options.reverse_merge!(DEFAULT_COURSE_DUPLICATION_OPTIONS)
      service = new(options)
      service.duplicate_course(current_course)
    end
  end

  DEFAULT_COURSE_DUPLICATION_OPTIONS =
    { mode: :course, new_title: 'Duplicated', current_user: User.system }.freeze

  # Duplicate the course with the duplicator.
  # Do not just pass in @selected_objects or object parents could be set incorrectly.
  #
  # @return [Course] The duplicated course
  def duplicate_course(current_course)
    duplicator.duplicate(current_course).tap do |new_course|
      notify_duplication_complete(new_course) if new_course.save
    end
  end

  private

  # Create a new duplication object to actually perform the duplication.
  # Initialize with the set of objects to be excluded from duplication, and the amount of time
  # to shift objects in the new course.
  #
  # @return [Duplicator]
  def initialize_duplicator(options)
    Duplicator.new(options[:excluded_objects], options.except(:excluded_objects))
  end

  # Sends an email to current_user to notify that the duplication is complete.
  #
  # @param [Course] new_course The duplicated course
  def notify_duplication_complete(new_course)
    Course::Mailer.
      course_duplicated_email(@options[:current_course], new_course, @options[:current_user]).
      deliver_now
  end
end
