# frozen_string_literal: true
class Course::Survey::OpeningReminderJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform(_, survey, token)
    ActsAsTenant.without_tenant do
      Course::Survey::ReminderService.opening_reminder(survey, token)
    end
  end
end
