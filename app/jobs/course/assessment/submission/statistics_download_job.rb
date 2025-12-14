# frozen_string_literal: true
class Course::Assessment::Submission::StatisticsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :highest
  retry_on StandardError, attempts: 0

  protected

  # Performs the download service.
  #
  # @param [Course] current_course The current course the submissions belong to
  # @param [User] current_user The user downloading the statistics.
  # @param [Array<Integer>] submission_ids the id of submissions to download statistics for
  def perform_tracked(current_course, current_user, submission_ids)
    service = Course::Assessment::Submission::StatisticsDownloadService.
              new(current_course, current_user, submission_ids)
    file_path = service.generate
    redirect_to SendFile.send_file(file_path)
  ensure
    service&.cleanup
  end
end
