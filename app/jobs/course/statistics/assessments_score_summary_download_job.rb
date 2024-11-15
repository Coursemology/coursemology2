# frozen_string_literal: true
class Course::Statistics::AssessmentsScoreSummaryDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  def perform_tracked(course, assessment_ids)
    file_name = "#{Pathname.normalize_filename(course.title)}_score_summary_#{Time.now.strftime '%Y%m%d_%H%M'}.csv"
    csv_file = Course::Statistics::AssessmentsScoreSummaryDownloadService.download(course, assessment_ids, file_name)
    redirect_to SendFile.send_file(csv_file, file_name)
  end
end
