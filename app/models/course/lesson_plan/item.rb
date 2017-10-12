# frozen_string_literal: true
class Course::LessonPlan::Item < ApplicationRecord
  include Course::LessonPlan::ItemTodoConcern

  actable
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

  belongs_to :course, inverse_of: :lesson_plan_items
  has_many :todos, class_name: Course::LessonPlan::Todo, inverse_of: :item, dependent: :destroy

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
      !start_at.present? || start_at - course.advance_start_at_duration < Time.zone.now
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
