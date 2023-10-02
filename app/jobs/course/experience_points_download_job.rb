# frozen_string_literal: true
class Course::ExperiencePointsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  def perform_tracked(current_course, course_user_id)
    csv_file = Course::ExperiencePointsDownloadService.
               download(current_course, course_user_id)
    redirect_to SendFile.send_file(csv_file)
  end
end
