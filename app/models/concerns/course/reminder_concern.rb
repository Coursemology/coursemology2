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
# Note that to prevent duplicate jobs, a random number of milliseconds is added to the date fields
# for each change to uniquely identify the most current set of jobs.
module Course::ReminderConcern
  extend ActiveSupport::Concern

  included do
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

  def setup_opening_reminders
    # Use current time as token to prevent duplicate notification. The float need to be round so
    # that the value stores in database will be consistent with the value passed to the job.
    self.opening_reminder_token = Time.zone.now.to_f.round(5)

    # Determine whether or not to send the opening reminder.
    send_opening_reminder = start_at && should_send_opening_reminder

    execute_after_commit do
      if send_opening_reminder
        opening_reminder_job_class.set(wait_until: start_at).
          perform_later(updater, self, opening_reminder_token)
      end
    end
  end

  def setup_closing_reminders
    # Use current time as token to prevent duplicate notification.
    self.closing_reminder_token = Time.zone.now.to_f.round(5)

    execute_after_commit do
      # Send notification one day before the closing date
      if end_at && end_at > Time.zone.now
        closing_reminder_job_class.set(wait_until: end_at - 1.day).
          perform_later(self, closing_reminder_token)
      end
    end
  end

  # Determines whether the opening reminder should be sent. Reminders always should be sent unless
  # the start_at and the old start_at dates are both in the past.
  #
  # Note: This should be invoked outside of the +execute_after_commit+ block, as
  # ActiveRecord::Dirty methods and attributes are not applied as the record has been saved.
  #
  # @return [Boolean] True if an opening reminder should be sent
  def should_send_opening_reminder
    time_now = Time.zone.now
    return false if start_at && start_at_was && start_at < time_now && start_at_was < time_now
    true
  end
end
