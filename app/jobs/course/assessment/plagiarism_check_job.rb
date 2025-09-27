# frozen_string_literal: true
class Course::Assessment::PlagiarismCheckJob < ApplicationJob
  include TrackableJob

  protected

  def perform_tracked(course, assessment)
    instance = Course.unscoped { course.instance }
    ActsAsTenant.with_tenant(instance) do
      service = Course::Assessment::Submission::SsidPlagiarismService.new(course, assessment)
      service.start_plagiarism_check
      assessment.plagiarism_check.update!(workflow_state: :running)
    rescue StandardError => e
      assessment.plagiarism_check.update!(workflow_state: :failed)
      raise e
    end
  end
end
