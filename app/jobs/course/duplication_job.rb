# frozen_string_literal: true
class Course::DuplicationJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  queue_as :duplication

  protected

  # Performs the duplication job.
  #
  # @param [Course] source_course The course to duplicate.
  # @param [Hash] option A hash of duplication options.
  def perform_tracked(source_course, options = {})
    ActsAsTenant.without_tenant do
      new_course =
        Course::Duplication::CourseDuplicationService.duplicate_course(source_course, options)
      redirect_to course_path(new_course) if new_course.valid?
    end
  end
end
