# frozen_string_literal: true
class ConsolidatedItemEmailJob < ApplicationJob
  # Start with opening reminders.
  def perform
    # Find courses which are just past midnight, then create an opening reminder activity
    # Use that activity to notify the course
    midnight_time_zones = ActiveSupport::TimeZone.all.select { |time| time.now.hour == 0 }.
                          map(&:name)
    ActsAsTenant.without_tenant do
      courses = Course.where(time_zone: midnight_time_zones)
      courses.each do |course|
        Course::ConsolidatedOpeningReminderNotifier.opening_reminder(course)
      end
    end
  end
end
