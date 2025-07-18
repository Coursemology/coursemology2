# frozen_string_literal: true
class Course::Assessment::SimilarityCheckJob < ApplicationJob
  include TrackableJob

  protected

  def perform_tracked(course, assessment)
    instance = Course.unscoped { course.instance }
    ActsAsTenant.with_tenant(instance) do
      service = Course::Assessment::Submission::SsidSimilarityService.new(course, assessment)
      service.run_similarity_check
      assessment.similarity_check.update!(workflow_state: :completed)
    rescue StandardError => e
      assessment.similarity_check.update!(workflow_state: :failed)
      raise e
    end
  end
end
