# frozen_string_literal: true
class Course::Survey::Question < ApplicationRecord
  enum question_type: { text: 0, multiple_choice: 1, multiple_response: 2 }

  validates_presence_of :description
  validates_inclusion_of :required, in: [true, false], message: :blank
  validates_presence_of :question_type
  validates_numericality_of :weight, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :weight
  validates_numericality_of :max_options, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_numericality_of :min_options, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_inclusion_of :grid_view, in: [true, false], message: :blank
  validates_presence_of :creator
  validates_presence_of :updater
  validates_presence_of :section

  belongs_to :section, inverse_of: :questions
  has_many :options, class_name: Course::Survey::QuestionOption.name,
                     inverse_of: :question, dependent: :destroy
  has_many :answers, class_name: Course::Survey::Answer.name,
                     inverse_of: :question, dependent: :destroy

  accepts_nested_attributes_for :options, allow_destroy: true

  def initialize_duplicate(duplicator, other)
    self.options = duplicator.duplicate(other.options)
  end
end
