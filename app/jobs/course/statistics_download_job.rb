# frozen_string_literal: true
class Course::StatisticsDownloadJob < ApplicationJob
  include TrackableJob
  queue_as :lowest

  protected

  # Performs the download service.
  #
  # @param [Course] course The course for which the student data is to be downloaded.
  # @param [User] course_user The user downloading the statistics.
  # @param [Boolean] can_analyze_videos Whether the user can analyze videos, accessed via can?(:analyze_videos, course).
  # @param [Boolean] only_my_students Whether only data for the user's students should be downloaded. If false,
  #   statistics for all students in the course will be downloaded. If true and the user is not in any groups, then an
  #   empty CSV will be returned.
  def perform_tracked(course, course_user, can_analyze_videos, only_my_students = false) # rubocop:disable Style/OptionalBooleanParameter
    csv_file = Course::StatisticsDownloadService.download(course, course_user, can_analyze_videos, only_my_students)
    redirect_to SendFile.send_file(csv_file, 'students_statistics.csv')
  end
end
