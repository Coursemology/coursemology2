# frozen_string_literal: true
class Course::Survey::Answer < ApplicationRecord
  validates :creator, presence: true
  validates :updater, presence: true
  validates :response, presence: true
  validates :question, presence: true
  validate :validate_required_answer, on: :update

  belongs_to :response, inverse_of: :answers
  belongs_to :question, inverse_of: :answers
  has_many :options, class_name: Course::Survey::AnswerOption.name,
                     inverse_of: :answer, dependent: :destroy
  has_many :question_options, through: :options

  accepts_nested_attributes_for :options

  def validate_required_answer
    return unless response.just_submitted? && question.required?

    case question.question_type
    when 'text'
      errors.add(:text_response, :cannot_be_empty) unless text_response.present?
    when 'multiple_choice', 'multiple_response'
      errors.add(:options, :cannot_be_empty) unless options.present?
    end
  end
end
