# frozen_string_literal: true
class Course::Survey::SurveyDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest
  retry_on StandardError, attempts: 0

  protected

  # Performs the download service.
  #
  # @param [Course::Survey] survey
  def perform_tracked(survey)
    service = Course::Survey::SurveyDownloadService.new(survey)
    csv_file = service.generate
    redirect_to SendFile.send_file(csv_file, "#{Pathname.normalize_filename(survey.title)}.csv")
  ensure
    service&.cleanup
  end
end
