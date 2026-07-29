# frozen_string_literal: true
# Runs the in-place version update in the background, matching marketplace import's polling flow.
class Course::Assessment::Marketplace::ApplyVersionJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  queue_as :duplication

  protected

  def perform_tracked(assessment, options = {})
    current_user = options[:current_user]
    Course::Assessment::Marketplace::ApplyVersionService.apply(assessment, current_user)

    course = assessment.course
    redirect_to course_assessment_url(course, assessment, host: course.instance.host)
  end
end
