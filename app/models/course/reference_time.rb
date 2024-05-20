# frozen_string_literal: true
class Course::ReferenceTime < ApplicationRecord
  include DuplicationStateTrackingConcern

  belongs_to :reference_timeline, class_name: 'Course::ReferenceTimeline', inverse_of: :reference_times
  belongs_to :lesson_plan_item, class_name: 'Course::LessonPlan::Item', inverse_of: :reference_times

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

    set_duplication_flag
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

    # When `duplicating?`, `end_at` change is emitted from the associated `Course::LessonPlan::Item`.
    # If the `Course::LessonPlan::Item` includes `CourseConcern::ClosingReminderConcern`, `end_at_changed?`
    # will be true on `before_save`, so the closing reminder token and job will be reset there. So,
    # there is no need for reference time to trigger the reset at all.
    #
    # Furthermore, when `duplicating?`, a `Course::LessonPlan::Item`'s default reference time MUST be
    # saved first for the `delegate`s to work. Otherwise, `end_at`, `end_at_changed?`, and other
    # delegated reference time-related attributes in `Course::LessonPlan::Item` will raise a
    # `Module::DelegationError` exception, akin to a cyclic dependency (but not exactly). In fact, we
    # are doing it in this method; see `actable&.end_at` below.
    #
    # Therefore, we skip the reset here when `duplicating?` and let the `Course::LessonPlan::Item`
    # trigger the closing reminder reset. Rather, it's not a reset, but create (since it's for a new
    # duplicated record).
    #
    # Note that this isn't a problem when a new `Course::LessonPlan::Item` is created normally (not
    # via duplication), thanks to `after_initialize :set_default_reference_time, if: :new_record?` in
    # `Course::LessonPlan::Item`.
    return if duplicating?

    # This check prevents `create_closing_reminders_at` from creating another `*ClosingReminderJob` if
    # `end_at` was changed from the `actable` (that includes `CourseConcern::ClosingReminderConcern`).
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
