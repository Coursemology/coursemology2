# frozen_string_literal: true
#
# This concern provides common reminder methods for lesson_plan_items, specifically reminders:
#   - When the lesson_plan_item is about to close
#
# When including this concern, the model is to implement the following for the reminders:
#   - #{Model-Name}::ClosingReminderJob
#
# Note that to prevent duplicate jobs, a random number of milliseconds is added to the date fields
# for each change to uniquely identify the most current set of jobs.
module Course::ClosingReminderConcern
  extend ActiveSupport::Concern

  included do
    before_save :reset_closing_reminders, if: :end_at_changed?
  end

  def create_closing_reminders_at(new_end_at)
    return if new_end_at <= Time.zone.now

    # Send notification one day before the closing date
    closing_reminder_job_class.set(wait_until: new_end_at - 1.day).
      perform_later(self, closing_reminder_token)
  end

  private

  def class_name
    self.class.name
  end

  def closing_reminder_job_class
    "#{class_name}::ClosingReminderJob".constantize
  end

  def reset_closing_reminders
    # Use current time as token to prevent duplicate notification.
    self.closing_reminder_token = Time.zone.now.to_f.round(5)

    execute_after_commit do
      create_closing_reminders_at(end_at) if end_at
    end
  end
end
