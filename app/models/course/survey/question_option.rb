# frozen_string_literal: true
class Course::Survey::QuestionOption < ApplicationRecord
  has_one_attachment

  validates_numericality_of :weight, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :weight
  validates_presence_of :question

  belongs_to :question, inverse_of: :options
  has_many :answer_options, class_name: Course::Survey::AnswerOption.name,
                            inverse_of: :question_option, dependent: :destroy

  def initialize_duplicate(duplicator, other)
    self.attachment = duplicator.duplicate(other.attachment)
  end
end
