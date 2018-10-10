# frozen_string_literal: true
class Course::Survey::Question < ApplicationRecord
  enum question_type: { text: 0, multiple_choice: 1, multiple_response: 2 }

  validates :description, presence: true
  validates :required, inclusion: { in: [true, false] }
  validates :question_type, presence: true
  validates :weight, numericality: { only_integer: true }, presence: true
  validates :max_options, numericality: { only_integer: true, greater_than_or_equal_to: 0,
                                          less_than: 2_147_483_648 }, allow_nil: true
  validates :min_options, numericality: { only_integer: true, greater_than_or_equal_to: 0,
                                          less_than: 2_147_483_648 }, allow_nil: true
  validates :grid_view, inclusion: { in: [true, false] }
  validates :creator, presence: true
  validates :updater, presence: true
  validates :section, presence: true

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
