# frozen_string_literal: true
class Course::Survey::QuestionOption < ApplicationRecord
  has_one_attachment

  validates :weight, numericality: { only_integer: true }, presence: true
  validates :question, presence: true

  belongs_to :question, inverse_of: :options
  has_many :answer_options, class_name: Course::Survey::AnswerOption.name,
                            inverse_of: :question_option, dependent: :destroy

  def initialize_duplicate(duplicator, other)
    self.attachment = duplicator.duplicate(other.attachment)
  end
end
