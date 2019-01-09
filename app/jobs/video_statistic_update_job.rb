# frozen_string_literal: true
class VideoStatisticUpdateJob < ApplicationJob
  private

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  # Compute total watch_freq and average percent_watched (of all associated submissions)
  # for every uncached Course::Video and upsert to course_video_statistics table
  def perform
    ActsAsTenant.without_tenant do
      Course::Video.
        includes([:statistic, { submissions: [:experience_points_record, :statistic, { sessions: :events }] }]).
        references(:all).select { |vid| vid.statistic.nil? || !vid.statistic.cached }.each do |video|
        video.create_submission_statistics
        video.build_statistic(watch_freq: video.watch_frequency,
                              percent_watched: video.calculate_percent_watched,
                              cached: true).upsert
      end
    end
  end
end
