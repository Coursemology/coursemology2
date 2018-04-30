# frozen_string_literal: true
class Course::ObjectDuplicationJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  queue_as :duplication

  protected

  # Performs the object duplication job.
  #
  # @param [Course] source_course Course to duplicate from.
  # @param [Course] destination_course Course to duplicate to.
  # @param [Object|Array] objects The object(s) to duplicate.
  # @param [Hash] options The options to be sent to the Duplicator object.
  def perform_tracked(source_course, destination_course, objects, options = {})
    ActsAsTenant.without_tenant do
      Course::Duplication::ObjectDuplicationService.duplicate_objects(
        source_course, destination_course, objects, options
      )
      redirect_to course_url(options[:destination_course], host: destination_course.instance.host)
    end
  end
end
