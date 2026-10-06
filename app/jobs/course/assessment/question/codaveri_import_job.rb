# frozen_string_literal: true
class Course::Assessment::Question::CodaveriImportJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers
  include Course::Assessment::Question::CodaveriQuestionConcern

  protected

  # Performs the import of the package contents into the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  def perform_tracked(question, attachment)
    ActsAsTenant.without_tenant { perform_import(question, attachment) }
  end

  private

  # Pushes the question to Codaveri.
  #
  # The question's current package is pushed rather than the given one, through the serialised push: the given
  # package could be older than one an import has pushed since this job was queued.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to push.
  # @param [Attachment] _attachment The question's package when this job was queued. Unused; kept so that jobs
  #   queued before this change still run.
  def perform_import(question, _attachment)
    safe_create_or_update_codaveri_question(question)
  end
end
