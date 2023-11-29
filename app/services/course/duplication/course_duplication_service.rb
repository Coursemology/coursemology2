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
    # @option options [DateTime] :destination_instance_id The destination instance of the duplicated course.
    # @param [Array] all_objects All the objects in the course.
    # @param [Array] selected_objects The objects to duplicate.
    # @return [Course] The duplicated course
    def duplicate_course(source_course, options = {}, all_objects = [], selected_objects = [])
      destination_instance_id = options[:destination_instance_id]
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
      service.duplicate_course(source_course, destination_instance_id)
    end
  end

  DEFAULT_COURSE_DUPLICATION_OPTIONS =
    { mode: :course, new_title: 'Duplicated', current_user: User.system }.freeze

  # Duplicate the course with the duplicator.
  # Do not just pass in @selected_objects or object parents could be set incorrectly.
  #
  # @return [Course] The duplicated course
  def duplicate_course(source_course, destination_instance_id)
    duplicated_course = Course.transaction do
      begin
        new_course = duplicator.duplicate(source_course)
        new_course.instance_id = destination_instance_id if destination_instance_id
        new_course.save!

        duplicator.set_option(:destination_course, new_course)

        # Destroy the new default reference timeline auto-created by `models/course.rb#set_defaults` to
        # make room for the default reference timeline that will be duplicated below.
        #
        # This reference timeline has to be set to default = false before it can be destroyed because
        # of the `models/course/reference_timeline.rb#prevent_destroy_if_default` invariant.
        #
        # Note that it is okay for a Course instance to have 0 default reference timeline, as seen in
        # `models/course.rb#validate_only_one_default_reference_timeline`. This is to accommodate
        # exactly this use case.
        default_reference_timeline = new_course.default_reference_timeline
        default_reference_timeline.default = false
        default_reference_timeline.destroy!

        new_course.reload

        source_course.duplication_manifest.each do |item|
          duplicator.duplicate(item).save!
          new_course.reload
        end

        update_course_settings(new_course, source_course)
        update_sidebar_settings(duplicator, new_course, source_course)

        # As per carrierwave v2.1.0, carrierwave image mounter that retains uploaded file as a cache
        # is reset upon reload (in our case it is new_course.reload).
        # As a result, logo duplication needs to be done after course reload.
        # https://github.com/carrierwaveuploader/carrierwave/issues/2482#issuecomment-762966926
        new_course.logo.duplicate_from(source_course.logo) if source_course.logo_url

        new_course
      rescue => _e # TO REMOVE - Testing for production duplication error
        Rails.logger.debug(message: 'Course duplication error debugging', error: _e, error_message: _e.message)
        raise ActiveRecord::Rollback
      end
    end
    notify_duplication_complete(duplicated_course)
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

  # Sends an email to current_user to notify that the duplication is complete/failed.
  #
  # @param [Course] new_course The duplicated course
  def notify_duplication_complete(new_course)
    if new_course
      Course::Mailer.
        course_duplicated_email(@options[:source_course], new_course, @options[:current_user]).
        deliver_now
    else
      Course::Mailer.
        course_duplicate_failed_email(@options[:source_course], @options[:current_user]).
        deliver_now
    end
  end

  # Updates category_ids in the duplicated course settings. This is to be run after the course has
  # been saved and category_ids are available.
  def update_course_settings(new_course, old_course)
    component_key = Course::AssessmentsComponent.key
    old_category_settings = old_course.settings.public_send(component_key)
    return true if old_category_settings.nil?

    new_category_settings = {}
    old_category_settings.each do |key, value|
      new_category_settings[key] = value
    end
    new_course.settings.public_send("#{component_key}=", new_category_settings)
    new_course.save!
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
      new_course.settings(:sidebar).public_send("assessments_#{old_category.id}=", nil)
    end
    new_course.save!
  end
end
