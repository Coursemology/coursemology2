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
    instance = Course.unscoped { question.assessment.course.instance }
    ActsAsTenant.with_tenant(instance) do
      perform_import(question, attachment)
    end
  end

  private

  # Copies the package from storage and imports the question.
  #
  # @param [Course::Assessment::Question::Programming] question The programming question to
  #   import the package to.
  # @param [Attachment] attachment The attachment containing the package.
  def perform_import(question, attachment)
    Course::Assessment::Question::ProgrammingImportService.import(question, attachment)
  ensure
    redirect_to edit_course_assessment_question_programming_path(question.assessment.course,
                                                                 question.assessment, question)
  end
end
