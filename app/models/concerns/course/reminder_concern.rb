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

  include Course::OpeningReminderConcern
  include Course::ClosingReminderConcern
end
