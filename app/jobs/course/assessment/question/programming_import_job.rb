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
    instance = nil
    Course.unscoped do
      instance = question.assessment.course.instance
    end
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
    Tempfile.create('programming-import', encoding: 'ascii-8bit', binmode: true) do |temporary_file|
      temporary_file.write(attachment.file_upload.read)
      temporary_file.seek(0)
      Course::Assessment::Question::ProgrammingImportService.import(question, temporary_file)
    end

  ensure
    redirect_to edit_course_assessment_question_programming_path(question.assessment.course,
                                                                 question.assessment, question)
  end
end
