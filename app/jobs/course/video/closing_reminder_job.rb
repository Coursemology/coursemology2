# frozen_string_literal: true
class Course::Video::ClosingReminderJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  def perform(video, token)
    ActsAsTenant.without_tenant do
      Course::Video::ReminderService.closing_reminder(video, token)
    end
  end
end
