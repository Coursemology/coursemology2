# frozen_string_literal: true

# Service to provide duplication of objects from current_course, to target_course.
class Course::Duplication::ObjectDuplicationService < Course::Duplication::BaseService
  class << self
    # Constructor for the object duplication service.
    #
    # @param [Course] current_course Course to duplicate from.
    # @param [Course] target_course Course to duplicate to.
    # @param [Object|Array] objects The object(s) to duplicate.
    # @param [Hash] options The options to be sent to the Duplicator object.
    # @option options [User] :current_user (+User.system+) The user triggering the duplication.
    # @return [Object|Array] The duplicated object(s).
    def duplicate_objects(current_course, target_course, objects, options = {})
      options[:time_shift] = time_shift(current_course, target_course)
      options[:current_course] = current_course
      options[:target_course] = target_course
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
    { mode: :object, unpublish_all: true, current_user: User.system }.freeze

  # Duplicate the objects with the duplicator.
  #
  # @param [Object|Array] objects An object or an array of objects to duplicate.
  # @return [Object] The duplicated object, if `objects` is a single object.
  # @return [Array] Array of duplicated objects, if `objects` is an array.
  def duplicate_objects(objects)
    # TODO: Email the user when the duplication is complete.
    Course.transaction do
      duplicated = duplicator.duplicate(objects)
      save_success = duplicated.respond_to?(:save) ? duplicated.save : duplicated.all?(&:save)
      after_save_success = save_success && after_save(objects, duplicated)
      raise ActiveRecord::Rollback unless after_save_success
      duplicated
    end
  end

  private

  # Executes callbacks meant to be invoked after duplicated objects have been saved.
  #
  # Models may implement `after_duplicate_save(duplicator)` if they have code to be executed after
  # all duplicates have been saved. The method should return `true` if the execution is successful
  # and false otherwise.
  #
  # @param [Object|Array] _objects The source object(s)
  # @param [Object|Array] duplicated The duplicated object(s)
  # @return [Boolean] true if all callbacks are executed successfully
  def after_save(_objects, duplicates)
    duplicates_array = duplicates.respond_to?(:to_ary) ? duplicates : [duplicates]
    duplicates_array.all? do |object|
      object.respond_to?(:after_duplicate_save) ? object.reload.after_duplicate_save(duplicator) : true
    end
  end

  # Initializes a new duplication object with the given options to perform the duplication.
  #
  # @return [Duplicator]
  def initialize_duplicator(options)
    Duplicator.new([], options)
  end
end
