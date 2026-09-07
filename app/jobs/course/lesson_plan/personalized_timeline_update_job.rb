# frozen_string_literal: true
# Recomputes one course user's personalised timeline.
#
# Enqueued after a submission is finalised, rather than run inside the finalise transaction: the
# recomputation walks every lesson plan item in the course and writes a personal time per shiftable
# item, which is by far the largest unit of work in that transaction and the only part that contends
# with +CoursewidePersonalizedTimelineUpdateJob+ for the same rows.
#
# The timeline is derived state. If this job never succeeds the student's timeline is one submission
# stale but still valid, and the next recomputation for them — their next submission, an instructor
# pressing "Recompute all times", or a coursewide run — brings it forward.
class Course::LessonPlan::PersonalizedTimelineUpdateJob < ApplicationJob
  include Course::LessonPlan::PersonalizationConcern

  queue_as :lowest

  rescue_from(ActiveJob::DeserializationError) do |_|
    # The course user was removed from the course before the job ran; there is no timeline to update.
  end

  def perform(course_user)
    instance = Course.unscoped { course_user.course.instance }

    ActsAsTenant.with_tenant(instance) do
      update_personalized_timeline_for_user(course_user)
    end
  end
end
