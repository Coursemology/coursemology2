# frozen_string_literal: true
class Course::QuestionAssessment < ApplicationRecord
  before_validation :set_defaults, if: :new_record?

  belongs_to :assessment, inverse_of: :question_assessments, class_name: Course::Assessment.name
  belongs_to :question, inverse_of: :question_assessments, class_name: Course::Assessment::Question.name
  has_and_belongs_to_many :skills, inverse_of: :question_assessments, class_name: Course::Assessment::Skill.name

  default_scope { order(weight: :asc) }

  # Prefixes a question number in front of the title
  #
  # @return [string]
  def display_title
    question_number = I18n.t('activerecord.course/assessment/question.question_number',
                             index: assessment.question_assessments.index(self) + 1)

    return question_number if question.title.blank?
    I18n.t('activerecord.course/assessment/question.question_with_title',
           question_number: question_number, title: question.title)
  end

  def initialize_duplicate(duplicator, other)
    self.weight = other.weight
    self.question = duplicator.duplicate(other.question.actable).acting_as
    skills << other.skills.select { |skill| duplicator.duplicated?(skill) }.
              map { |skill| duplicator.duplicate(skill) }
  end

  private

  def set_defaults
    return if weight.present? || !assessment || assessment.new_record?

    # Make sure new questions appear at the end of the list.
    max_weight = assessment.questions.pluck(:weight).max
    self.weight ||= max_weight ? max_weight + 1 : 0
  end
end
