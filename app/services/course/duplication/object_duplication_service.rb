# frozen_string_literal: true

# Service to provide duplication of objects from current_course, to target_course.
class Course::Duplication::ObjectDuplicationService < Course::Duplication::BaseService
  class << self
    # Constructor for the object duplication service.
    #
    # @param [Array] objects The objects to duplicate.
    # @param [Hash] options The options to be sent to the Duplicator object.
    # @option options [User] :current_user (+User.system+) The user triggering the duplication.
    # @option options [Course] :current_course
    # @option options [DateTime] :target_course
    # @return [Array] The duplicated objects
    def duplicate_objects(objects, options = {})
      options[:time_shift] = time_shift(options[:current_course], options[:target_course])
      options.reverse_merge!(DEFAULT_OBJECT_DUPLICATION_OPTIONS)
      service = new(options)
      service.duplicate_objects(objects)
    end

    # Calculates the time difference between the +start_at+ of the current and target course.
    #
    # @param [Course] current_course
    # @param [Course] target_course
    # @return [Float] Time difference between the +start_at+ of both courses.
    def time_shift(current_course, target_course)
      shift = target_course.start_at - current_course.start_at
      shift >= 0 ? shift : 0
    end
  end

  DEFAULT_OBJECT_DUPLICATION_OPTIONS =
    { mode: :object, current_user: User.system }.freeze

  # Duplicate the objects with the duplicator.
  #
  # @return [Course] The duplicated objects
  def duplicate_objects(objects)
    # TODO: Inform the user when the duplication is complete.
    Course.transaction do
      duplicated = duplicator.duplicate(objects)
      success = duplicated.respond_to?(:save) ? duplicated.save : duplicated.all?(&:save)
      raise ActiveRecord::Rollback unless success
      duplicated
    end
  end

  private

  # Initializes a new duplication object with the given options to perform the duplication.
  #
  # @return [Duplicator]
  def initialize_duplicator(options)
    Duplicator.new([], options)
  end
end
