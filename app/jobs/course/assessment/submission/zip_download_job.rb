# frozen_string_literal: true
class Course::Assessment::Submission::ZipDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :highest

  protected

  # Performs the download service.
  #
  # @param [CourseUser] course_user The course user downloading the submissions.
  # @param [Course::Assessment] assessment The assessments to download submissions for.
  # @param [String|nil] course_users The subset of course users whose submissions to download.
  def perform_tracked(course_user, assessment, course_users = nil)
    service = Course::Assessment::Submission::ZipDownloadService.new(course_user, assessment, course_users)
    zip_file = service.download_and_zip
    redirect_to SendFile.send_file(zip_file, "#{Pathname.normalize_filename(assessment.title)}.zip")
  ensure
    service&.cleanup
  end
end
