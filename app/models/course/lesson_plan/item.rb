# frozen_string_literal: true
class Course::LessonPlan::Item < ApplicationRecord
  include Course::LessonPlan::ItemTodoConcern

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

  validate :validate_presence_of_bonus_end_at,
           :validate_start_at_cannot_be_after_end_at
  validates :base_exp, :time_bonus_exp, numericality: { greater_than_or_equal_to: 0 }
  validates_length_of :actable_type, allow_nil: true, maximum: 255
  validates_length_of :title, allow_nil: true, maximum: 255
  validates_presence_of :title
  validates_inclusion_of :published, in: [true, false], message: :blank
  validates_numericality_of :base_exp, allow_nil: true, only_integer: true,
                                       greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :base_exp
  validates_numericality_of :time_bonus_exp, allow_nil: true, only_integer: true,
                                             greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :time_bonus_exp
  validates_presence_of :start_at
  validates_numericality_of :closing_reminder_token, allow_nil: true
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :course
  validates_uniqueness_of :actable_id, scope: [:actable_type], allow_nil: true,
                                       if: -> { actable_type? && actable_id_changed? }
  validates_uniqueness_of :actable_type, scope: [:actable_id], allow_nil: true,
                                         if: -> { actable_id? && actable_type_changed? }

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

  # @!method self.opening_within_next_day
  #   Scopes the lesson plan items to those which are opening in the next 24 hours.
  scope :opening_within_next_day, (lambda do
    includes(reference_times: :reference_timeline).
        where(course_reference_timelines: { default: true }).
        merge(Course::ReferenceTime.where(start_at: (Time.zone.now)..(1.day.from_now))).
        references(reference_times: :reference_timeline)
  end)

  belongs_to :course, inverse_of: :lesson_plan_items
  has_many :todos, class_name: Course::LessonPlan::Todo.name, inverse_of: :item, dependent: :destroy

  # TODO(#3092): Figure out what to do with monkey-patched start_at / bonus_start_at / end_at
  delegate :start_at, :start_at=, :start_at_changed?, :bonus_end_at, :bonus_end_at=, :bonus_end_at_changed?,
           :end_at, :end_at=, :end_at_changed?,
           to: :default_reference_time
  before_validation :link_default_reference_time

  # Finds the lesson plan items which are starting within the next day for a given course.
  # Rearrange the items into a hash keyed by the actable type as a string.
  # For example:
  # {
  #   ActableType_1_as_String => [ActableItems...],
  #   ActableType_2_as_String => [ActableItems...]
  # }
  #
  # @param course [Course] The course to check for published items starting within the next day.
  # @return [Hash]
  def self.upcoming_items_from_course_by_type(course)
    opening_items = course.lesson_plan_items.published.opening_within_next_day
    opening_items_hash = Hash.new { |hash, actable_type| hash[actable_type] = [] }
    opening_items.select { |item| item.actable.include_in_consolidated_email?(:opening) }.
      each do |item|
        opening_items_hash[item.actable_type].push(item.actable)
      end
    # Sort the items for each actable type by start_at time, followed by title.
    opening_items_hash.each_value { |items| items.sort_by! { |item| [item.start_at, item.title] } }
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
  def self_directed_started?
    if course&.advance_start_at_duration
      start_at.blank? || start_at - course.advance_start_at_duration < Time.zone.now
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

  def validate_start_at_cannot_be_after_end_at
    return unless end_at && start_at && start_at > end_at
    errors.add(:start_at, :cannot_be_after_end_at)
  end
end
