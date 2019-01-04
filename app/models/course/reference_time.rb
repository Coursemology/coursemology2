# frozen_string_literal: true
class Course::ReferenceTime < ApplicationRecord
  belongs_to :reference_timeline, class_name: Course::ReferenceTimeline.name, inverse_of: :reference_times
  belongs_to :lesson_plan_item, class_name: Course::LessonPlan::Item.name, inverse_of: :reference_times

  validates :start_at, presence: true
  validates :reference_timeline, presence: true, uniqueness: { scope: :lesson_plan_item }
  validates :lesson_plan_item, presence: true

  validate :validate_start_at_cannot_be_after_end_at

  def initialize_duplicate(duplicator, other)
    self.reference_timeline = duplicator.duplicate(other.reference_timeline)
    self.start_at = duplicator.time_shift(other.start_at)
    self.bonus_end_at = duplicator.time_shift(other.bonus_end_at) if other.bonus_end_at
    self.end_at = duplicator.time_shift(other.end_at) if other.end_at
  end

  def validate_start_at_cannot_be_after_end_at
    errors.add(:start_at, :cannot_be_after_end_at) if end_at && start_at && start_at > end_at
  end
end
