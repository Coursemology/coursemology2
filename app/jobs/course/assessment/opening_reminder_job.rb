class Course::Assessment::OpeningReminderJob < ApplicationJob
  include TrackableJob

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform_tracked(user, assessment, start_at)
    instance = Course.unscoped { assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Assessment::ReminderService.opening_reminder(user, assessment, start_at)
    end
  end
end
