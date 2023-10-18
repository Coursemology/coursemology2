# frozen_string_literal: true
class Course::ExperiencePointsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  def perform_tracked(course, course_user_id)
    csv_file = Course::ExperiencePointsDownloadService.download(course, course_user_id)
    redirect_to SendFile.send_file(csv_file, "#{Pathname.normalize_filename(course.title)}_exp_records.csv")
  end
end
