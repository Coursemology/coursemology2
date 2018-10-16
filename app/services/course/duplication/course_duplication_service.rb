# frozen_string_literal: true

# Service to provide a full duplication of a Course.
class Course::Duplication::CourseDuplicationService < Course::Duplication::BaseService
  class << self
    # Constructor for the course duplication service.
    #
    # @param [Course] source_course The course to duplicate.
    # @param [Hash] options The options to be sent to the Duplicator object.
    # @option options [User] :current_user (+User.system+) The user triggering the duplication.
    # @option options [String] :new_title ('Duplicated') The title for the duplicated course.
    # @option options [DateTime] :new_start_at Start date and time for the duplicated course.
    # @param [Array] all_objects All the objects in the course.
    # @param [Array] selected_objects The objects to duplicate.
    # @return [Course] The duplicated course
    def duplicate_course(source_course, options = {}, all_objects = [], selected_objects = [])
      excluded_objects = all_objects - selected_objects
      options[:excluded_objects] = excluded_objects
      options[:source_course] = source_course
      options[:time_shift] =
        if options[:new_start_at]
          Time.zone.parse(options[:new_start_at]) - source_course.start_at
        else
          0
        end
      options.reverse_merge!(DEFAULT_COURSE_DUPLICATION_OPTIONS)
      service = new(options)
      service.duplicate_course(source_course)
    end
  end

  DEFAULT_COURSE_DUPLICATION_OPTIONS =
    { mode: :course, new_title: 'Duplicated', current_user: User.system }.freeze

  # Duplicate the course with the duplicator.
  # Do not just pass in @selected_objects or object parents could be set incorrectly.
  #
  # @return [Course] The duplicated course
  def duplicate_course(source_course)
    duplicated_course = Course.transaction do
      new_course = duplicator.duplicate(source_course)
      raise ActiveRecord::Rollback unless new_course.save
      duplicator.set_option(:destination_course, new_course)

      # Delete the auto-generated default reference timeline in favor of duplicating existing one
      raise ActiveRecord::Rollback unless new_course.default_reference_timeline.destroy
      new_course.reload

      source_course.duplication_manifest.each do |item|
        raise ActiveRecord::Rollback unless duplicator.duplicate(item).save
        new_course.reload
      end
      raise ActiveRecord::Rollback unless update_course_settings(duplicator, new_course, source_course)
      raise ActiveRecord::Rollback unless update_sidebar_settings(duplicator, new_course, source_course)
      new_course
    end
    notify_duplication_complete(duplicated_course) unless duplicated_course.nil?
    duplicated_course
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
      course_duplicated_email(@options[:source_course], new_course, @options[:current_user]).
      deliver_now
  end

  # Updates category_ids in the duplicated course settings. This is to be run after the course has
  # been saved and category_ids are available.
  def update_course_settings(duplicator, new_course, old_course)
    component_key = Course::AssessmentsComponent.key
    old_category_settings = old_course.settings.public_send(component_key)
    return true if old_category_settings.nil?
    new_category_settings = {}
    old_course.assessment_categories.each do |old_category|
      new_category = duplicator.duplicate(old_category)
      new_category_settings[new_category.id.to_s] = old_category_settings[old_category.id.to_s]
    end
    new_course.settings.public_send("#{component_key}=", new_category_settings)
    new_course.save
  end

  # Update sidebar settings keys with the new assessment category IDs.
  # Remove old keys with the original course's assessment category ID numbers from the sidebar
  # settings.
  def update_sidebar_settings(duplicator, new_course, old_course)
    old_course.assessment_categories.each do |old_category|
      new_category = duplicator.duplicate(old_category)
      weight = old_course.settings(:sidebar, "assessments_#{old_category.id}").weight
      next unless weight
      new_course.settings(:sidebar).settings("assessments_#{new_category.id}").weight = weight
      new_course.settings(:sidebar).send("assessments_#{old_category.id}=", nil)
    end
    new_course.save
  end
end
