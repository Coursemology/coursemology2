class Course::Assessment::ClosingReminderJob < ApplicationJob
  include TrackableJob

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform_tracked(user, assessment, token)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::ReminderService.closing_reminder(user, assessment, token)
    end
  end
end
