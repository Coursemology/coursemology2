# frozen_string_literal: true
class Course::Assessment::Marketplace::PreviewCleanupJob < ApplicationJob
  BATCH_LIMIT = 1000
  TTL = 48.hours

  def perform
    ActsAsTenant.without_tenant do
      reapable_markers(TTL.ago).each { |marker| destroy_copy(marker) }
    end
  end

  private

  def reapable_markers(cutoff)
    Course::Assessment::Marketplace::Preview.
      joins('LEFT JOIN course_assessment_submissions ' \
            'ON course_assessment_submissions.assessment_id = ' \
            'course_assessment_marketplace_previews.assessment_id').
      group('course_assessment_marketplace_previews.id').
      having('COALESCE(MAX(course_assessment_submissions.updated_at), ' \
             'course_assessment_marketplace_previews.updated_at) <= ?', cutoff).
      order('course_assessment_marketplace_previews.id').
      limit(BATCH_LIMIT)
  end

  def destroy_copy(marker)
    marker.assessment&.destroy!
  rescue StandardError => e
    Rails.logger.warn("[PreviewCleanupJob] skipped preview #{marker.id}: #{e.class}: #{e.message}")
  end
end
