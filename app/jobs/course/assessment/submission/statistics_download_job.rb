# frozen_string_literal: true
class Course::Assessment::Submission::StatisticsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  # Performs the download service.
  #
  # @param [User] current_user The user downloading the statistics.
  # @param [Array<Integer>] submission_ids the id of submissions to download statistics for
  def perform_tracked(current_user, submission_ids)
    file_path = Course::Assessment::Submission::StatisticsDownloadService.
                download(current_user, submission_ids)
    redirect_to SendFile.send_file(file_path)
  end
end
