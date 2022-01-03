# frozen_string_literal: true
class Course::StatisticsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  # Performs the download service.
  def perform_tracked(course, course_user, can_analyze_videos, only_my_students = false)
    csv_file = Course::StatisticsDownloadService.download(course, course_user, can_analyze_videos, only_my_students)
    redirect_to SendFile.send_file(csv_file, 'students.csv')
  end
end
