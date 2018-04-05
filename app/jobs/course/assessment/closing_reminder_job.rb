# frozen_string_literal: true
class Course::Assessment::ClosingReminderJob < ApplicationJob
  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform(assessment, token)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::ReminderService.closing_reminder(assessment, token)
    end
  end
end
