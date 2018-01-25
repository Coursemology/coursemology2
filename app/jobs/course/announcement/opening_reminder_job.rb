# frozen_string_literal: true
class Course::Announcement::OpeningReminderJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform(user, announcement, token)
    instance = Course.unscoped { announcement.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Announcement::ReminderService.opening_reminder(user, announcement, token)
    end
  end
end
