# frozen_string_literal: true
class Course::Story
  class << self
    def for_course_user(course_user)
      return nil unless course_user.course.component_enabled?(Course::StoriesComponent)

      Cikgo::TimelinesService.items(course_user).map do |item|
        new(item, course_user)
      end
    end
  end

  class PersonalTime
    delegate_missing_to :@personal_time

    def initialize(course_user, story_id, start_at)
      @personal_time = Course::PersonalTime.new(course_user: course_user, start_at: start_at)
      @story_id = story_id
    end

    def save
      Cikgo::TimelinesService.update_time(course_user, @story_id, start_at)
    end

    alias_method :save!, :save
  end

  attr_reader :id, :submitted_at, :reference_time, :personal_time

  delegate :start_at, to: :reference_time

  def initialize(provided_item, course_user)
    @id = provided_item[:storyId]
    @submitted_at = provided_item[:completedAt]&.in_time_zone
    @course_user = course_user

    @reference_time = Course::ReferenceTime.new(
      start_at: provided_item[:startAt].in_time_zone,
      reference_timeline_id: @course_user.reference_timeline_id
    )

    personal_start_at = provided_item[:ownStartAt]&.in_time_zone
    @personal_time = PersonalTime.new(@course_user, @id, personal_start_at) if personal_start_at
  end

  def time_for(_course_user)
    personal_time || reference_time
  end

  def personal_time_for(_course_user)
    personal_time
  end

  def reference_time_for(_course_user)
    reference_time
  end

  def find_or_create_personal_time_for(_course_user)
    return personal_time if personal_time.present?

    PersonalTime.new(@course_user, @id, reference_time.start_at)
  end

  def has_personal_times? # rubocop:disable Naming/PredicateName
    true
  end

  # Since stories on Cikgo have no end times, they effectively do not affect personal times,
  # i.e., `compute_learning_rate_ema` filters them out. Setting this to `false` reduces the
  # number of items that the personalisation strategies have to iterate.
  def affects_personal_times?
    false
  end
end
