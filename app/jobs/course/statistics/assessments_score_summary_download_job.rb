# frozen_string_literal: true
class Course::Statistics::AssessmentsScoreSummaryDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest
  retry_on StandardError, attempts: 0

  protected

  def perform_tracked(course, assessment_ids)
    file_name = "#{Pathname.normalize_filename(course.title)}_score_summary_#{Time.now.strftime '%Y%m%d_%H%M'}.csv"
    service = Course::Statistics::AssessmentsScoreSummaryDownloadService.new(course, assessment_ids, file_name)
    csv_file = service.generate
    redirect_to SendFile.send_file(csv_file, file_name)
  ensure
    service&.cleanup
  end
end
