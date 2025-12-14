# frozen_string_literal: true
class Course::Assessment::Submission::CsvDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :highest
  retry_on StandardError, attempts: 0

  protected

  # Performs the submission download as csv service.
  #
  # @param [CourseUser] current_course_user The course user downloading the submissions.
  # @param [Course::Assessment] assessment The assessments to download submissions for.
  # @param [String|nil] course_users The subset of course users whose submissions to download.
  def perform_tracked(current_course_user, assessment, course_users = nil)
    service = Course::Assessment::Submission::CsvDownloadService.new(current_course_user, assessment, course_users)
    csv_file = service.generate
    redirect_to SendFile.send_file(csv_file, "#{Pathname.normalize_filename(assessment.title)}.csv")
  ensure
    service&.cleanup
  end
end
