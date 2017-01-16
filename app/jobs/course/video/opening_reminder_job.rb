class Course::Video::OpeningReminderJob < ApplicationJob
  include TrackableJob

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  protected

  def perform_tracked(user, video, token)
    instance = Course.unscoped { video.course.instance }
    ActsAsTenant.with_tenant(instance) do
      Course::Video::ReminderService.opening_reminder(user, video, token)
    end
  end
end
