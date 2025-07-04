# frozen_string_literal: true
class Course::Assessment::Question::TextResponse < ApplicationRecord
  acts_as :question, class_name: 'Course::Assessment::Question'

  DEFAULT_MAX_ATTACHMENTS = 50
  DEFAULT_MAX_ATTACHMENT_SIZE_MB = 1024

  validates :max_attachments, numericality: { only_integer: true, greater_than_or_equal_to: 0,
                                              less_than_or_equal_to: DEFAULT_MAX_ATTACHMENTS },
                              presence: true
  validates :max_attachment_size, numericality: { only_integer: true, greater_than_or_equal_to: 1,
                                                  less_than_or_equal_to: DEFAULT_MAX_ATTACHMENT_SIZE_MB },
                                  allow_nil: true
  validate :validate_grade

  has_many :solutions, class_name: 'Course::Assessment::Question::TextResponseSolution',
                       dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  has_many :groups, class_name: 'Course::Assessment::Question::TextResponseComprehensionGroup',
                    dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :solutions, allow_destroy: true

  accepts_nested_attributes_for :groups, allow_destroy: true

  def is_saving_snapshots?
    false
  end

  def auto_gradable?
    if comprehension_question?
      groups.any?(&:auto_gradable_group?)
    else
      !solutions.empty?
    end
  end

  # Method provides readability to identifying whether a question is a file upload question.
  #  Used with the front-end translations.
  def file_upload_question?
    hide_text
  end

  # Method provides readability to identifying whether a question is a
  # (GCE A-Level General Paper) comprehension question.
  def comprehension_question?
    is_comprehension
  end

  def question_type_sym
    if file_upload_question?
      :file_upload
    elsif comprehension_question?
      :comprehension
    else
      :text_response
    end
  end

  def question_type
    if file_upload_question?
      'FileUpload'
    elsif comprehension_question?
      'Comprehension'
    else
      'TextResponse'
    end
  end

  def question_type_readable
    if file_upload_question?
      I18n.t('activerecord.attributes.models.course/assessment/question/text_response.file_upload')
    elsif comprehension_question?
      I18n.t('activerecord.attributes.models.course/assessment/question/text_response.comprehension')
    else
      I18n.t('activerecord.attributes.models.course/assessment/question/text_response.text_response')
    end
  end

  def default_max_attachments
    DEFAULT_MAX_ATTACHMENTS
  end

  def default_max_attachment_size
    DEFAULT_MAX_ATTACHMENT_SIZE_MB
  end

  def computed_max_attachment_size
    max_attachment_size || DEFAULT_MAX_ATTACHMENT_SIZE_MB
  end

  def auto_grader
    if comprehension_question?
      Course::Assessment::Answer::TextResponseComprehensionAutoGradingService.new
    else
      Course::Assessment::Answer::TextResponseAutoGradingService.new
    end
  end

  def attempt(submission, last_attempt = nil)
    answer =
      Course::Assessment::Answer::TextResponse.new(submission: submission, question: question)
    if last_attempt
      answer.answer_text = last_attempt.answer_text
      if last_attempt.attachment_references.any?
        answer.attachment_references = last_attempt.attachment_references.map(&:dup)
      end
    end
    answer.acting_as
  end

  def files_downloadable?
    true
  end

  def csv_downloadable?
    !hide_text && max_attachments == 0
  end

  def history_viewable?
    true
  end

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    if comprehension_question?
      self.groups = duplicator.duplicate(other.groups)
    else
      self.solutions = duplicator.duplicate(other.solutions)
    end
  end

  def build_at_least_one_group_one_point
    groups.build if groups.empty?
    groups.first.points.build if groups.first.points.empty?
  end

  private

  def validate_grade
    return if comprehension_question? || solutions.all? { |s| s.grade <= maximum_grade }

    errors.add(:maximum_grade, :invalid_grade)
  end
end
