# frozen_string_literal: true
class Course::Assessment::Question::ProgrammingImportJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

  protected

  # Performs the import of the package contents into the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  def perform_tracked(question, attachment, max_time_limit)
    question.max_time_limit = max_time_limit
    ActsAsTenant.without_tenant { perform_import(question, attachment) }
  end

  private

  # Copies the package from storage and imports the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  def perform_import(question, attachment)
    Course::Assessment::Question::ProgrammingImportService.import(question, attachment)
    # Make an API call to Codaveri to create/update question if the import above is succesful.
    if question.is_codaveri || question.live_feedback_enabled
      Course::Assessment::Question::ProgrammingCodaveriService.create_or_update_question(question, attachment)
    end
    # Re-run the tests since the test results are deleted with the old package.
    Course::Assessment::Question::AnswersEvaluationJob.perform_later(question)
  end
end
