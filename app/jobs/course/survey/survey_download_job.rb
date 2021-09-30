# frozen_string_literal: true
class Course::Survey::SurveyDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  # Performs the download service.
  #
  # @param [Course::Survey] survey
  def perform_tracked(survey)
    csv_file = Course::Survey::SurveyDownloadService.download(survey)
    redirect_to SendFile.send_file(csv_file, "#{Pathname.normalize_filename(survey.title)}.csv")
  end
end
