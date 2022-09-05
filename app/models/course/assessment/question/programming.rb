# frozen_string_literal: true
class Course::Assessment::Question::Programming < ApplicationRecord
  enum package_type: { zip_upload: 0, online_editor: 1 }

  # The table name for this model is singular.
  self.table_name = table_name.singularize

  # Maximum CPU time a programming question can allow before the evaluation gets killed.
  CPU_TIMEOUT = 30.seconds

  # Maximum memory (in MB) the programming question can allow.
  # Do NOT change this to num.megabytes as the ProgramingEvaluationService expects it in MB.
  # Currently set to nil as Java evaluations do not work with a `ulimit` below 3 GB.
  # Docker container memory limits will keep the evaluation in check.
  MEMORY_LIMIT = nil

  include DuplicationStateTrackingConcern
  acts_as :question, class_name: Course::Assessment::Question.name

  before_save :process_package, unless: :skip_process_package?
  before_validation :assign_template_attributes
  before_validation :assign_test_case_attributes

  validates :memory_limit, numericality: { greater_than: 0, less_than: 2_147_483_648 }, allow_nil: true
  validates :time_limit, numericality: { greater_than: 0, less_than_or_equal_to: CPU_TIMEOUT }, allow_nil: true
  validates :attempt_limit, numericality: { only_integer: true,
                                            greater_than: 0, less_than: 2_147_483_648 }, allow_nil: true
  validates :package_type, presence: true
  validates :multiple_file_submission, inclusion: { in: [true, false] }
  validates :import_job_id, uniqueness: { allow_nil: true, if: :import_job_id_changed? }
  validates :language, presence: true

  validate :validate_codaveri_question

  belongs_to :import_job, class_name: TrackableJob::Job.name, inverse_of: nil, optional: true
  belongs_to :language, class_name: Coursemology::Polyglot::Language.name, inverse_of: nil
  has_one_attachment
  has_many :template_files, class_name: Course::Assessment::Question::ProgrammingTemplateFile.name,
                            dependent: :destroy, foreign_key: :question_id, inverse_of: :question
  has_many :test_cases, class_name: Course::Assessment::Question::ProgrammingTestCase.name,
                        dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  def auto_gradable?
    !test_cases.empty?
  end

  def edit_online?
    package_type == 'online_editor'
  end

  def auto_grader
    if is_codaveri
      Course::Assessment::Answer::ProgrammingCodaveriAutoGradingService.new
    else
      Course::Assessment::Answer::ProgrammingAutoGradingService.new
    end
  end

  def attempt(submission, last_attempt = nil)
    answer = Course::Assessment::Answer::Programming.new(submission: submission, question: question)
    if last_attempt
      last_attempt.files.each do |file|
        answer.files.build(filename: file.filename, content: file.content)
      end
    else
      copy_template_files_to(answer)
    end
    answer.acting_as
  end

  def to_partial_path
    'course/assessment/question/programming/programming'
  end

  # This specifies the attachment which was imported.
  #
  # Using this to assign the attachment when you do not want to run the evaluation callbacks when the record is saved.
  def imported_attachment=(attachment)
    self.attachment = attachment
    clear_attachment_change
  end

  # Copies the template files from this question to the specified answer.
  #
  # @param [Course::Assessment::Answer::Programming] answer The answer to copy the template files
  # to.
  def copy_template_files_to(answer)
    template_files.each do |template_file|
      template_file.copy_template_to(answer)
    end
  end

  # Groups test cases by test case type. Each key returns an array of all the test cases
  # of that type.
  #
  # @return [Hash] A hash of the test cases keyed by test case type.
  def test_cases_by_type
    test_cases.group_by(&:test_case_type)
  end

  def files_downloadable?
    true
  end

  def csv_downloadable?
    template_files.size == 1
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    # TODO: check if there are any side effects from this
    self.import_job_id = nil
    self.template_files = duplicator.duplicate(other.template_files)
    self.test_cases = duplicator.duplicate(other.test_cases)
    self.imported_attachment = duplicator.duplicate(other.attachment)

    set_duplication_flag
  end

  # This specifies the template files generated from the online editor.
  #
  # This is used by the +Course::Assessment::Question::Programming::ProgrammingPackageService+ to
  # set the template files for a non-autograded programming question.
  def non_autograded_template_files=(template_files)
    self.template_files.clear
    self.template_files = template_files
    test_cases.clear
  end

  # returns the type of question i.e. Programming
  def question_type
    if is_codaveri
      I18n.t('course.assessment.question.programming.question_type_codaveri')
    else
      I18n.t('course.assessment.question.programming.question_type')
    end
  end

  # Returns language name in lowercase format (eg python, java).
  #
  # @return [String] The language name in lowercase format.
  def polyglot_language_name
    language.name.split[0].downcase
  end

  # Returns language version.
  #
  # @return [String] The language version.
  def polyglot_language_version
    language.name.split[1]
  end

  private

  # Create new package or re-evaluate the old package.
  def process_package
    if attachment_changed?
      attachment ? process_new_package : remove_old_package
    elsif time_limit_changed? || memory_limit_changed? || language_id_changed? || (is_codaveri_changed? && is_codaveri)
      # For non-autograded questions, the attachment is not present
      evaluate_package if attachment
    end
  end

  def evaluate_package
    execute_after_commit do
      import_job =
        Course::Assessment::Question::ProgrammingImportJob.perform_later(self, attachment)
      update_column(:import_job_id, import_job.job_id)
    end
  end

  # Queues the new question package for processing.
  #
  # We restore the original package, but capture the new package into a local for processing by
  # the import job.
  def process_new_package
    new_attachment = attachment
    restore_attachment_change

    execute_after_commit do
      new_attachment.save!
      import_job =
        Course::Assessment::Question::ProgrammingImportJob.perform_later(self, new_attachment)
      update_column(:import_job_id, import_job.job_id)
    end
  end

  # Removes the template files and test cases from the old package.
  def remove_old_package
    template_files.clear
    test_cases.clear
    self.import_job = nil
  end

  def assign_template_attributes
    template_files.each do |template|
      template.question = self
    end
  end

  def assign_test_case_attributes
    test_cases.each do |test_case|
      test_case.question = self
    end
  end

  def skip_process_package?
    duplicating?
  end

  def validate_codaveri_question # rubocop:disable Metrics/AbcSize
    return if !is_codaveri || duplicating?

    if question_assessments.first.assessment.autograded?
      errors.add(:base, 'Assessment type must not be autograded')
    elsif !codaveri_language_whitelist.include?(language.type.constantize)
      errors.add(:base, 'Language type must be Python 3 and above')
    elsif !question_assessments.first.assessment.course.component_enabled?(Course::CodaveriComponent)
      errors.add(:base,
                 'Codaveri component is deactivated.
                 Activate it in the course setting or switch this question into a non-codaveri type.')
    end

    nil
  end

  def codaveri_language_whitelist
    [Coursemology::Polyglot::Language::Python::Python3Point4,
     Coursemology::Polyglot::Language::Python::Python3Point5,
     Coursemology::Polyglot::Language::Python::Python3Point6,
     Coursemology::Polyglot::Language::Python::Python3Point7,
     Coursemology::Polyglot::Language::Python::Python3Point9,
     Coursemology::Polyglot::Language::Python::Python3Point10]
  end
end
