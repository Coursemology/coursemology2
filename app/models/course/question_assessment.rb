# frozen_string_literal: true
class Course::QuestionAssessment < ApplicationRecord
  before_validation :set_defaults, if: :new_record?

  validates :weight, numericality: { only_integer: true }, presence: true
  validates :assessment, presence: true
  validates :question, presence: true
  validates :assessment_id, uniqueness: { scope: [:question_id], if: -> { question_id? && assessment_id_changed? } }
  validates :question_id, uniqueness: { scope: [:assessment_id], if: -> { assessment_id? && question_id_changed? } }

  validate :validate_koditsu_question

  belongs_to :assessment, inverse_of: :question_assessments, class_name: 'Course::Assessment'
  belongs_to :question, inverse_of: :question_assessments, class_name: 'Course::Assessment::Question'
  has_and_belongs_to_many :skills, inverse_of: :question_assessments, class_name: 'Course::Assessment::Skill'

  default_scope { order(weight: :asc) }

  scope :with_question_actables, (lambda do
    includes(
      question: {
        actable: [:language, :options, :test_cases, :solutions]
      }
    )
  end)

  def default_title(num = nil)
    idx = num.present? ? num : question_number
    I18n.t('activerecord.course/assessment/question.question_number', index: idx)
  end

  # Prefixes a question number in front of the title
  #
  # @return [string]
  def display_title(num = nil)
    question_num = default_title(num)
    return question_num if question.title.blank?

    I18n.t('activerecord.course/assessment/question.question_with_title',
           question_number: question_num, title: question.title)
  end

  def initialize_duplicate(duplicator, other)
    self.weight = other.weight
    self.question = duplicator.duplicate(other.question.actable).acting_as
    skills << other.skills.select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end

  def question_number
    assessment.question_assessments.index(self) + 1
  end

  def validate_koditsu_question
    return unless koditsu_enabled? && question&.question_type == 'Programming'

    add_language_errors unless language_valid_for_koditsu?
  end

  private

  def koditsu_enabled?
    is_course_koditsu_enabled = assessment&.course&.component_enabled?(Course::KoditsuPlatformComponent)

    is_course_koditsu_enabled && assessment&.is_koditsu_enabled
  end

  def language_valid_for_koditsu?
    language = question.actable.language
    language.koditsu_whitelisted?
  end

  def add_language_errors
    question.errors.add(:base, 'Language type is not compatible with Koditsu')
  end

  def set_defaults
    return if weight.present? || !assessment || assessment.new_record?

    # Make sure new questions appear at the end of the list.
    max_weight = assessment.questions.pluck(:weight).max
    self.weight ||= max_weight ? max_weight + 1 : 0
  end
end
