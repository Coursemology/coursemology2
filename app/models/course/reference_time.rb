# frozen_string_literal: true
class Course::ReferenceTime < ApplicationRecord
  belongs_to :reference_timeline, class_name: Course::ReferenceTimeline.name, inverse_of: :reference_times
  belongs_to :lesson_plan_item, class_name: Course::LessonPlan::Item.name, inverse_of: :reference_times

  validates :start_at, presence: true
  validates :reference_timeline, presence: true, uniqueness: { scope: :lesson_plan_item }
  validates :lesson_plan_item, presence: true

  validate :start_at_cannot_be_after_end_at
  validate :lesson_plan_item_in_same_course

  before_destroy :prevent_destroy_if_in_default_timeline, prepend: true

  before_save :reset_closing_reminders, if: :end_at_changed?

  # TODO(#3448): Consider creating personal times if new_record?
  after_commit :update_personal_times, on: :update

  def initialize_duplicate(duplicator, other)
    self.reference_timeline = duplicator.duplicate(other.reference_timeline)
    reference_timeline.reference_times << self
    self.start_at = duplicator.time_shift(other.start_at)
    self.bonus_end_at = duplicator.time_shift(other.bonus_end_at) if other.bonus_end_at
    self.end_at = duplicator.time_shift(other.end_at) if other.end_at
  end

  private

  def start_at_cannot_be_after_end_at
    errors.add(:start_at, :cannot_be_after_end_at) if end_at && start_at && start_at > end_at
  end

  def update_personal_times
    return unless (previous_changes.keys & ['start_at', 'end_at']).any?

    Course::LessonPlan::CoursewidePersonalizedTimelineUpdateJob.perform_later(lesson_plan_item)
  end

  def reset_closing_reminders
    actable = lesson_plan_item.actable

    # This check prevents `create_closing_reminders_at` from creating another `*ClosingReminderJob` if
    # `end_at` was changed from the `actable` (that includes `Course::ClosingReminderConcern`).
    actable_end_at_already_updated = actable&.end_at == end_at
    return unless !actable_end_at_already_updated && actable.respond_to?(:create_closing_reminders_at)

    actable.create_closing_reminders_at(end_at)
    actable.save!
  end

  def lesson_plan_item_in_same_course
    errors.add(:lesson_plan_item, :must_be_in_same_course) if reference_timeline.course_id != lesson_plan_item.course_id
  end

  def prevent_destroy_if_in_default_timeline
    return true if lesson_plan_item.destroying? || reference_timeline.destroying? || !reference_timeline.default?

    errors.add(:reference_timeline, :cannot_destroy_in_default_timeline)
    throw(:abort)
  end
end
