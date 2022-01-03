# frozen_string_literal: true
class Course::QuestionAssessment < ApplicationRecord
  before_validation :set_defaults, if: :new_record?

  validates :weight, numericality: { only_integer: true }, presence: true
  validates :assessment, presence: true
  validates :question, presence: true

  belongs_to :assessment, inverse_of: :question_assessments, class_name: Course::Assessment.name
  belongs_to :question, inverse_of: :question_assessments, class_name: Course::Assessment::Question.name
  has_and_belongs_to_many :skills, inverse_of: :question_assessments, class_name: Course::Assessment::Skill.name

  default_scope { order(weight: :asc) }

  scope :with_question_actables, -> { includes({ question: { actable: [:options, :test_cases, :solutions] } }) }

  # Prefixes a question number in front of the title
  #
  # @return [string]
  def display_title(num = nil)
    idx = num.present? ? num : question_number
    question_num = I18n.t('activerecord.course/assessment/question.question_number',
                          index: idx)

    return question_num if question.title.blank?

    I18n.t('activerecord.course/assessment/question.question_with_title',
           question_number: question_num, title: question.title)
  end

  def initialize_duplicate(duplicator, other)
    self.weight = other.weight
    self.question = other.question
    skills << other.skills.select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end

  def question_number
    assessment.question_assessments.index(self) + 1
  end

  private

  def set_defaults
    return if weight.present? || !assessment || assessment.new_record?

    # Make sure new questions appear at the end of the list.
    max_weight = assessment.questions.pluck(:weight).max
    self.weight ||= max_weight ? max_weight + 1 : 0
  end
end
