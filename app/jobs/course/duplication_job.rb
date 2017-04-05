# frozen_string_literal: true
class Course::DuplicationJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  queue_as :lowest

  protected

  # Performs the duplication job.
  #
  # @param [Course] current_course The course to duplicate.
  # @param [Hash] option A hash of duplication options.
  # @param [Array] all_objects All the objects in the course.
  # @param [Array] selected_objects The objects to duplicate.
  def perform_tracked(current_course, options = {}, all_objects = [], selected_objects = [])
    ActsAsTenant.without_tenant do
      new_course = Course::DuplicationService.
                   duplicate_course(current_course, options, all_objects, selected_objects)
      redirect_to course_path(new_course) if new_course.valid?
    end
  end
end
