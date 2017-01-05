# frozen_string_literal: true
#
# This concern provides common reminder methods for lesson_plan_items, specifically reminders:
#   - When the lesson_plan_item is open for students to attempt; and
#   - When the lesson_plan_item is about to close
#
# When including this concern, the model is to implement the following for the reminders:
#   - #{Model-Name}::OpeningReminderJob
#   - #{Model-Name}::CloseReminderJob
#
# Note that to prevent duplicate jobs, a random number of miliseconds is added to the date fields
# for each change to uniquely identify the most current set of jobs.
module Course::ReminderConcern
  extend ActiveSupport::Concern

  included do
    before_validation :prevent_reminder_duplication
    before_save :setup_opening_reminders, if: :start_at_changed?
    before_save :setup_closing_reminders, if: :end_at_changed?
  end

  private

  def class_name
    self.class.name
  end

  def opening_reminder_job_class
    "#{class_name}::OpeningReminderJob".constantize
  end

  def closing_reminder_job_class
    "#{class_name}::ClosingReminderJob".constantize
  end

  # Prevent duplicate reminder from being sent due to floating point changes
  def prevent_reminder_duplication
    self.start_at = start_at_was if start_at.to_f.floor == start_at_was.to_f.floor
    self.end_at = end_at_was if end_at.to_f.floor == end_at_was.to_f.floor
  end

  def setup_opening_reminders
    # Randomize the milliseconds of the reminders' datetime to prevent duplication
    self.start_at += Random.rand(0...0.1).round(4)

    execute_after_commit do
      opening_reminder_job_class.set(wait_until: start_at).
        perform_later(creator, self, start_at.to_f)
    end
  end

  def setup_closing_reminders
    # Randomize the milliseconds of the reminders' datetime to prevent duplication
    self.end_at += Random.rand(0...0.1).round(4)

    execute_after_commit do
      # Send notification one day before the closing date
      closing_reminder_job_class.set(wait_until: end_at - 1.day).
        perform_later(creator, self, end_at.to_f)
    end
  end
end
