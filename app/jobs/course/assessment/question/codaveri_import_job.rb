# frozen_string_literal: true
class Course::Assessment::Question::CodaveriImportJob < ApplicationJob
  include TrackableJob
  include Rails.application.routes.url_helpers

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

  # Copies the package from storage and imports the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  def perform_import(question, attachment)
    Course::Assessment::Question::ProgrammingCodaveriService.create_or_update_question(question, attachment)
  end
end
