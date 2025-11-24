# frozen_string_literal: true
class Course::ExperiencePointsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  def perform_tracked(course, course_user_id)
    service = Course::ExperiencePointsDownloadService.new(course, course_user_id)
    csv_file = service.generate
    redirect_to SendFile.send_file(csv_file, "#{Pathname.normalize_filename(course.title)}_exp_records.csv")
  ensure
    service&.cleanup
  end
end
