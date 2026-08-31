# frozen_string_literal: true
class VideoStatisticUpdateJob < ApplicationJob
  # Records loaded per batch. Deliberately small: every statistic row carries a +watch_freq+ integer
  # array with one element per second of video, so a batch's memory cost is measured in seconds of
  # video, not in rows.
  BATCH_SIZE = 100

  rescue_from(ActiveJob::DeserializationError) do |_|
    # Prevent the job from retrying due to deleted records
  end

  # Update video submission statistic for outdated cache.
  # Compute total watch_freq and average percent_watched (of all associated submissions)
  # for every uncached Course::Video and upsert to course_video_statistics table.
  #
  # Both passes filter in SQL and stream in batches. This job is not tenant-scoped, so filtering in
  # Ruby instead would load every video and every video submission in the database into memory at
  # once, regardless of how few of them are actually stale.
  def perform
    ActsAsTenant.without_tenant do
      update_uncached_submission_statistics
      update_uncached_video_statistics
    end
  end

  private

  # Driven from the statistic side, which is where the +cached+ flag lives. Submissions without a
  # statistic have nothing to recompute and are skipped, as before.
  def update_uncached_submission_statistics
    Course::Video::Submission::Statistic.where(cached: false).
      includes(submission: :video).
      find_each(batch_size: BATCH_SIZE) { |statistic| statistic.submission.update_statistic }
  end

  def update_uncached_video_statistics
    uncached_videos.find_each(batch_size: BATCH_SIZE) do |video|
      video.build_statistic(watch_freq: video.watch_frequency,
                            percent_watched: video.calculate_percent_watched,
                            cached: true).upsert
    end
  end

  # Videos with no statistic at all, or whose statistic is stale. +cached+ is +NOT NULL+, so a NULL
  # can only mean the outer join found no statistic row.
  def uncached_videos
    Course::Video.left_joins(:statistic).preload(:statistic).
      where(course_video_statistics: { cached: [false, nil] })
  end
end
