# frozen_string_literal: true
class Course::LessonPlan::Item < ApplicationRecord
  include Course::LessonPlan::ItemTodoConcern

  has_many :personal_times,
           foreign_key: :lesson_plan_item_id, class_name: Course::PersonalTime.name,
           inverse_of: :lesson_plan_item, dependent: :destroy, autosave: true
  has_many :reference_times,
           foreign_key: :lesson_plan_item_id, class_name: Course::ReferenceTime.name, inverse_of: :lesson_plan_item,
           dependent: :destroy, autosave: true
  has_one :default_reference_time,
          -> { joins(:reference_timeline).where(course_reference_timelines: { default: true }) },
          foreign_key: :lesson_plan_item_id, class_name: Course::ReferenceTime.name, inverse_of: :lesson_plan_item,
          autosave: true
  validates :default_reference_time, presence: true
  validate :validate_only_one_default_reference_time

  actable optional: true
  has_many_attachments on: :description

  after_initialize :set_default_reference_time, if: :new_record?
  after_initialize :set_default_values, if: :new_record?

  validate :validate_presence_of_bonus_end_at
  validates :base_exp, :time_bonus_exp, numericality: { greater_than_or_equal_to: 0 }
  validates :actable_type, length: { maximum: 255 }, allow_nil: true
  validates :title, length: { maximum: 255 }, presence: true
  validates :published, inclusion: { in: [true, false] }
  validates :movable, inclusion: { in: [true, false] }
  validates :triggers_recomputation, inclusion: { in: [true, false] }
  validates :base_exp, numericality: { only_integer: true, greater_than_or_equal_to: -2_147_483_648,
                                       less_than: 2_147_483_648 }, presence: true
  validates :time_bonus_exp, numericality: { only_integer: true, greater_than_or_equal_to: -2_147_483_648,
                                             less_than: 2_147_483_648 }, presence: true
  validates :closing_reminder_token, numericality: true, allow_nil: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :course, presence: true
  validates :actable_id, uniqueness: { scope: [:actable_type], allow_nil: true,
                                       if: -> { actable_type? && actable_id_changed? } }
  validates :actable_type, uniqueness: { scope: [:actable_id], allow_nil: true,
                                         if: -> { actable_id? && actable_type_changed? } }

  # @!method self.ordered_by_date
  #   Orders the lesson plan items by the starting date.
  scope :ordered_by_date, (lambda do
    includes(reference_times: :reference_timeline).
      where(course_reference_timelines: { default: true }).
      merge(Course::ReferenceTime.order(:start_at))
  end)

  scope :ordered_by_date_and_title, (lambda do
    includes(reference_times: :reference_timeline).
      where(course_reference_timelines: { default: true }).
      merge(Course::ReferenceTime.order(:start_at)).
      order(:title)
  end)

  # @!method self.published
  #   Returns only the lesson plan items that are published.
  scope :published, (lambda do
    where(published: true)
  end)

  scope :with_personal_times_for, (lambda do |course_user|
    personal_times =
      if course_user.nil?
        []
      else
        Course::PersonalTime.where(course_user_id: course_user.id, lesson_plan_item_id: all).to_a
      end

    all.to_a.tap do |result|
      preloader = ActiveRecord::Associations::Preloader::ManualPreloader.new
      preloader.preload(result, :personal_times, personal_times)
    end
  end)

  # Loads the reference times for `course_user`. If `course_user` is nil, then we load the default reference time for
  # `course`.
  scope :with_reference_times_for, (lambda do |course_user, course = nil|
    # Can't eager-load if we have no idea who we are eager-loading for
    return if course_user.nil? && course.nil?

    reference_timeline_id = course_user&.reference_timeline_id ||
                            course_user&.course&.default_reference_timeline&.id ||
                            course.default_reference_timeline.id
    eager_load(:reference_times).where(course_reference_times: { reference_timeline_id: reference_timeline_id })
  end)

  # @!method self.with_actable_types
  #   Scopes the lesson plan items to those which belong to the given actable_types.
  #   Each actable type is further scoped to return the IDs of items for display.
  #   actable_data is provided to help the actable types figure out what should be displayed.
  #
  # @param actable_hash [Hash{String => Array<String> or nil}] Hash of actable_names to data.
  scope :with_actable_types, lambda { |actable_hash|
    where(
      actable_hash.map do |actable_type, actable_data|
        "course_lesson_plan_items.id IN (#{actable_type.constantize.
        ids_showable_in_lesson_plan(actable_data).to_sql})"
      end.join(' OR ')
    )
  }

  belongs_to :course, inverse_of: :lesson_plan_items
  has_many :todos, class_name: Course::LessonPlan::Todo.name, inverse_of: :item, dependent: :destroy

  # TODO(#3092): Figure out what to do with monkey-patched start_at / bonus_start_at / end_at
  delegate :start_at, :start_at=, :start_at_changed?, :bonus_end_at, :bonus_end_at=, :bonus_end_at_changed?,
           :end_at, :end_at=, :end_at_changed?,
           to: :default_reference_time
  before_validation :link_default_reference_time

  # Returns a frozen CourseReferenceTime or CoursePersonalTime.
  # The calling function is responsible for eager-loading both associations if calling time_for on a lot of items.
  # TODO(#3902): Lookup user's reference timeline before defaulting to default reference timeline
  def time_for(course_user)
    personal_time = personal_time_for(course_user)
    reference_time = reference_time_for(course_user)
    (personal_time || reference_time).clone.freeze
  end

  def personal_time_for(course_user)
    return nil if course_user.nil?

    # Do not make a separate call to DB if personal_times has already been preloaded
    if personal_times.loaded?
      personal_times.find { |x| x.course_user_id == course_user.id }
    else
      personal_times.find_by(course_personal_times: { course_user_id: course_user.id })
    end
  end

  def reference_time_for(course_user)
    # Do not make a separate call to DB if reference_times has already been preloaded
    reference_timeline_id = course_user&.reference_timeline_id || course.default_reference_timeline.id
    if reference_times.loaded?
      reference_times.find { |x| x.reference_timeline_id == reference_timeline_id }
    else
      reference_times.find_by(course_reference_times: { reference_timeline_id: reference_timeline_id })
    end
  end

  # Gets the existing personal time for course_user, or instantiates and returns a new one
  def find_or_create_personal_time_for(course_user)
    personal_time = personal_time_for(course_user)
    return personal_time if personal_time.present?

    personal_time = personal_times.new(course_user: course_user)
    reference_time = reference_time_for(course_user)
    personal_time.start_at = reference_time.start_at
    personal_time.end_at = reference_time.end_at
    personal_time.bonus_end_at = reference_time.bonus_end_at
    personal_time
  end

  # Finds the lesson plan items which are starting within the next day for a given course user.
  # Rearrange the items into a hash keyed by the actable type as a string.
  # For example:
  # {
  #   ActableType_1_as_String => [ActableItems...],
  #   ActableType_2_as_String => [ActableItems...]
  # }
  #
  # @param course_user [CourseUser] The course user to check for published items starting within the next day.
  # @return [Hash]
  def self.upcoming_items_from_course_by_type_for_course_user(course_user)
    course = course_user.course
    opening_items = course.lesson_plan_items.published.
                    with_reference_times_for(course_user).
                    with_personal_times_for(course_user).
                    to_a
    opening_items_hash = Hash.new { |hash, actable_type| hash[actable_type] = [] }
    opening_items.
      select { |item| item.time_for(course_user).start_at.in?((Time.zone.now)..(1.day.from_now)) }.
      select { |item| item.actable.include_in_consolidated_email?(:opening) }.
      each { |item| opening_items_hash[item.actable_type].push(item.actable) }
    # Sort the items for each actable type by start_at time, followed by title.
    opening_items_hash.each_value do |items|
      items.sort_by! { |item| [item.time_for(course_user).start_at, item.title] }
    end
  end

  # Copy attributes for lesson plan item from the object being duplicated.
  # Shift the time related fields.
  #
  # @param other [Object] The source object to copy attributes from.
  # @param duplicator [Duplicator] The Duplicator object
  def copy_attributes(other, duplicator)
    self.course = duplicator.options[:destination_course]
    self.default_reference_time = duplicator.duplicate(other.default_reference_time)

    # TODO(#3092):
    #   - For course duplication, we can copy all reference timelines
    #   - For object duplication, we need to figure out which reference timelines
    other_reference_times = other.reference_times - [other.default_reference_time]
    self.reference_times = duplicator.duplicate(other_reference_times).unshift(default_reference_time)

    self.title = other.title
    self.description = other.description
    self.published = duplicator.options[:unpublish_all] ? false : other.published
    self.base_exp = other.base_exp
    self.time_bonus_exp = other.time_bonus_exp
  end

  # Test if the lesson plan item has started for self directed learning.
  #
  # @return [Boolean]
  def self_directed_started?(course_user = nil)
    if course&.advance_start_at_duration
      time_for(course_user).start_at.blank? ||
        time_for(course_user).start_at - course.advance_start_at_duration < Time.zone.now
    else
      started?
    end
  end

  private

  # Sets default EXP values
  def set_default_values
    self.base_exp ||= 0
    self.time_bonus_exp ||= 0
  end

  def set_default_reference_time
    self.default_reference_time ||= Course::ReferenceTime.new(lesson_plan_item: self)
  end

  def link_default_reference_time
    self.default_reference_time.reference_timeline = course.default_reference_timeline
    self.default_reference_time.lesson_plan_item = self
  end

  # TODO(#3092): Validate only one for each reference timeline
  def validate_only_one_default_reference_time
    num_defaults = reference_times.
                   includes(:reference_timeline).
                   where(course_reference_timelines: { default: true }).
                   count
    return if num_defaults <= 1 # Could be 0 if item is new
    errors.add(:reference_times, :must_have_at_most_one_default)
  end

  # User must set bonus_end_at if there's bonus exp
  def validate_presence_of_bonus_end_at
    return unless time_bonus_exp && time_bonus_exp > 0 && bonus_end_at.blank?
    errors.add(:bonus_end_at, :required)
  end
end
