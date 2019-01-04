# frozen_string_literal: true
class Course::PersonalTime < ApplicationRecord
  belongs_to :course_user, inverse_of: :personal_times
  belongs_to :lesson_plan_item, class_name: Course::LessonPlan::Item.name, inverse_of: :personal_times

  validates :start_at, presence: true
  validates :course_user, presence: true, uniqueness: { scope: :lesson_plan_item }
  validates :lesson_plan_item, presence: true

  validate :validate_start_at_cannot_be_after_end_at

  def validate_start_at_cannot_be_after_end_at
    errors.add(:start_at, :cannot_be_after_end_at) if end_at && start_at && start_at > end_at
  end
end
