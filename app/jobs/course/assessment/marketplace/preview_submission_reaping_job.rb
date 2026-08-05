# frozen_string_literal: true
# Reaps aged marketplace preview submissions on a TTL, scheduled weekly via `config/schedule.yml`
# (`Course::Assessment::Marketplace::PreviewContainerService`'s container course is the only source of
# these submissions). Never touches the container course, the assessment copies, or the previewers'
# enrolments — those are deliberately persistent and reused across preview sessions.
class Course::Assessment::Marketplace::PreviewSubmissionReapingJob < ApplicationJob
  # Keyed on `updated_at` (last activity), not `created_at`, so an in-progress rehearsal is never
  # reaped out from under someone still working, and async autograding has time to land before a
  # destroy could race it.
  #
  # This is the floor on how long an attempt is kept, not the ceiling: the weekly cron means an aged
  # submission may linger up to a week past it.
  PREVIEW_SUBMISSION_TTL = 24.hours

  # Cap deletions per run to avoid bricking the worker (mirrors UserEmailDatabaseCleanupJob). Note
  # this caps a WEEK's reaping, not an hour's: if preview volume ever exceeds it, aged submissions
  # accumulate faster than they are removed and the cron needs raising before this does.
  REAP_BATCH_SIZE = 1000

  def perform
    ActsAsTenant.without_tenant do
      reap_aged_preview_submissions
    end
  end

  private

  def reap_aged_preview_submissions
    User.with_stamper(User.system) do
      Course::Assessment::Submission.transaction do
        aged_preview_submissions.group_by(&:assessment).each do |assessment, submissions|
          creator_ids = []
          submissions.each do |submission|
            submission.destroy!
            creator_ids << submission.creator_id
          end

          Course::Assessment::Submission::MonitoringService.destroy_all_by(assessment, creator_ids)
        end
      end
    end
  end

  # Derived from the course, not a deep join: `Course::Assessment` is `acts_as` a
  # `Course::LessonPlan::Item`, so a `joins(assessment: { tab: :category })` chain is fragile.
  def aged_preview_submissions
    preview_assessment_ids = Course.where(preview: true).flat_map { |course| course.assessments.pluck(:id) }

    Course::Assessment::Submission.
      includes(:assessment).
      where(assessment_id: preview_assessment_ids).
      where(updated_at: ...PREVIEW_SUBMISSION_TTL.ago).
      limit(REAP_BATCH_SIZE)
  end
end
