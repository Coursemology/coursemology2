# frozen_string_literal: true
class Course::LessonPlan::Item < ApplicationRecord
  include Course::LessonPlan::ItemTodoConcern

  actable optional: true
  has_many_attachments

  after_initialize :set_default_values, if: :new_record?

  validate :validate_presence_of_bonus_end_at,
           :validate_start_at_cannot_be_after_end_at
  validates :base_exp, :time_bonus_exp, numericality: { greater_than_or_equal_to: 0 }

  # @!method self.ordered_by_date
  #   Orders the lesson plan items by the starting date.
  scope :ordered_by_date, (lambda do
    order(:start_at)
  end)

  scope :ordered_by_date_and_title, (lambda do
    order(:start_at, :title)
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
    where(start_at: (Time.zone.now)..(1.day.from_now))
  end)

  belongs_to :course, inverse_of: :lesson_plan_items
  has_many :todos, class_name: Course::LessonPlan::Todo.name, inverse_of: :item, dependent: :destroy

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
    opening_items = course.lesson_plan_items.published.opening_within_next_day.includes(:actable)
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
    self.title = other.title
    self.description = other.description
    self.published = duplicator.options[:unpublish_all] ? false : other.published
    self.base_exp = other.base_exp
    self.time_bonus_exp = other.time_bonus_exp
    self.start_at = duplicator.time_shift(other.start_at)
    self.bonus_end_at = duplicator.time_shift(other.bonus_end_at) if other.bonus_end_at
    self.end_at = duplicator.time_shift(other.end_at) if other.end_at
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

  # User must set bonus_end_at if there's bonus exp
  def validate_presence_of_bonus_end_at
    if time_bonus_exp && time_bonus_exp > 0 && bonus_end_at.blank?
      errors.add(:bonus_end_at, :required)
    end
  end

  def validate_start_at_cannot_be_after_end_at
    return unless end_at && start_at && start_at > end_at
    errors.add(:start_at, :cannot_be_after_end_at)
  end
end
