# frozen_string_literal: true
class Course::Video::ClosingReminderJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform(user, video, token)
    instance = Course.unscoped { video.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Video::ReminderService.closing_reminder(user, video, token)
    end
  end
end
