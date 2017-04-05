# frozen_string_literal: true
class Course::Survey::ClosingReminderJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform(survey, token)
    ActsAsTenant.without_tenant do
      Course::Survey::ReminderService.closing_reminder(survey, token)
    end
  end
end
