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
    Course::Assessment::Question::ProgrammingImportService.import(question, attachment)
    # Re-run the tests since the test results are deleted with the old package.
    Course::Assessment::Question::AnswersEvaluationJob.perform_later(question)
  ensure
    redirect_to edit_course_assessment_question_programming_path(question.assessment.course,
                                                                 question.assessment, question)
  end
end
