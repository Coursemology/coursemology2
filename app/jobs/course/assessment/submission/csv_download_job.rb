# frozen_string_literal: true
class Course::Assessment::Submission::CsvDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :highest

  protected

  # Performs the submission download as csv service.
  #
  # @param [CourseUser] current_course_user The course user downloading the submissions.
  # @param [Course::Assessment] assessment The assessments to download submissions for.
  # @param [String|nil] course_users The subset of course users whose submissions to download.
  def perform_tracked(current_course_user, assessment, course_users = nil)
    csv_file = Course::Assessment::Submission::CsvDownloadService.
               download(current_course_user, assessment, course_users)
    redirect_to SendFile.send_file(csv_file, "#{Pathname.normalize_filename(assessment.title)}.csv")
  end
end
