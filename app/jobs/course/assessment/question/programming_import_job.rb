# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingImportJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  include Course::Assessment::Question::CodaveriQuestionConcern

  protected

  # Performs the import of the package contents into the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  # @param [Hash{String => Object}, nil] previous_version The question's column values before the edit that
  #   queued this import, used to snapshot the version the import replaces.
  def perform_tracked(question, attachment, max_time_limit, previous_version = nil)
    question.max_time_limit = max_time_limit
    ActsAsTenant.without_tenant { perform_import(question, attachment, previous_version) }
  end

  private

  # Copies the package from storage and imports the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  # @param [Hash{String => Object}, nil] previous_version See #perform_tracked.
  def perform_import(question, attachment, previous_version)
    imported = Course::Assessment::Question::ProgrammingImportService.
               import(question, attachment, previous_version, import_job_id: job_id)
    # Superseded by a later edit, whose own import applies its package, pushes it to Codaveri and regrades.
    return unless imported

    # Push the imported version to Codaveri. Through the serialised push, which sends the question's current version:
    # pushing this job's own package could leave Codaveri on an older version, were a later import's push to land
    # first.
    safe_create_or_update_codaveri_question(question) if question.is_codaveri || question.live_feedback_enabled
    # Re-run the tests since the test results are deleted with the old package.
    Course::Assessment::Question::AnswersEvaluationJob.perform_later(question)
  end
end
