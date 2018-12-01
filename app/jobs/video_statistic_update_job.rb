# frozen_string_literal: true
class VideoStatisticUpdateJob < ApplicationJob

  private

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  def perform
    # Compute total watch_freq and average percent_watched (of all associated submissions)
    # for every uncached Course::Video and save to course_video_statistics table
    ActsAsTenant.without_tenant do
      Course::Video.where(workflow_state: 'uncached').includes(:submissions).references(:all).
        where(id: [198, 201, 244, 256, 261, 262, 252, 260, 1465, 259]).each do |video|
        video.submissions.map{ |submission| cache_submission(submission, video.duration) }
        average_coverage = video.submissions.size > 0 ?
          (video.submissions.map { |submission| submission.statistic.percent_watched }.reduce(:+) / video.submissions.size).round :
          0
        video.update(workflow_state: 'cached') if
          video.build_statistic(watch_freq: video.watch_frequency, percent_watched: average_coverage).upsert
      end
    end
  end

  # Compute watch_freq and percent_watched for Course::Video::Submission if uncached
  # and save to course_video_statistics table
  def cache_submission(submission, duration)
    return unless submission.statistic.nil?
    frequency_array = submission.watch_frequency
    coverage = duration > 0 ?
      coverage = (100 * (frequency_array.count { |x| x > 0 }) / duration).round :
      0
    submission.build_statistic(watch_freq: frequency_array, percent_watched: coverage).upsert
  end
end
