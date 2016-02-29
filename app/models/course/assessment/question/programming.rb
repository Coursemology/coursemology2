# frozen_string_literal: true
class Course::Assessment::Question::Programming < ActiveRecord::Base
  # The table name for this model is singular.
  self.table_name = table_name.singularize

  acts_as :question, class_name: Course::Assessment::Question.name

  before_save :process_new_package, if: :attachment_changed?

  validates :memory_limit, :time_limit, numericality: { greater_then: 0 }, allow_nil: true

  belongs_to :import_job, class_name: TrackableJob::Job.name, inverse_of: nil
  belongs_to :language, class_name: Coursemology::Polyglot::Language.name, inverse_of: nil
  has_one_attachment
  has_many :template_files, class_name: Course::Assessment::Question::ProgrammingTemplateFile.name,
                            dependent: :destroy, foreign_key: :question_id, inverse_of: :question
  has_many :test_cases, class_name: Course::Assessment::Question::ProgrammingTestCase.name,
                        dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  def auto_gradable?
    !test_cases.empty?
  end

  def auto_grader
    Course::Assessment::Answer::ProgrammingAutoGradingService.new
  end

  def attempt(submission)
    answer = submission.programming_answers.build(submission: submission, question: question)
    copy_template_files_to(answer)
    answer.answer
  end

  def to_partial_path
    'course/assessment/question/programming/programming'.freeze
  end

  # This specifies the attachment which was imported.
  #
  # This is used by the +Course::Assessment::Question::ProgrammingImportService+ to indicate
  # the actual attachment which was imported. This does not run the evaluator again when the
  # record is saved.
  def imported_attachment=(attachment)
    self.attachment = attachment
    clear_attribute_changes(:attachment)
  end

  private

  # Copies the template files from this question to the specified answer.
  #
  # @param [Course::Assessment::Answer::Programming] answer The answer to copy the template files
  # to.
  def copy_template_files_to(answer)
    template_files.each do |template_file|
      template_file.copy_template_to(answer)
    end
  end

  # Queues the new question package for processing.
  #
  # We restore the original package, but capture the new package into a local for processing by
  # the import job.
  def process_new_package
    return remove_old_package if attachment.nil?

    new_attachment = attachment
    restore_attribute!(:attachment)

    execute_after_commit do
      new_attachment.save!
      import_job =
        Course::Assessment::Question::ProgrammingImportJob.perform_later(self, new_attachment)
      update(import_job_id: import_job.job_id)
    end
  end

  # Removes the template files and test cases from the old package.
  def remove_old_package
    template_files.clear
    test_cases.clear
    self.import_job = nil
  end
end
