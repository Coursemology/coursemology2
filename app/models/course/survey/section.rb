# frozen_string_literal: true
class Course::Survey::Section < ApplicationRecord
  validates_length_of :title, allow_nil: true, maximum: 255
  validates_presence_of :title
  validates_numericality_of :weight, allow_nil: true, only_integer: true, greater_than_or_equal_to: -2147483648, less_than: 2147483648
  validates_presence_of :weight
  validates_presence_of :survey

  belongs_to :survey, inverse_of: :sections
  has_many :questions, inverse_of: :section, dependent: :destroy

  def initialize_duplicate(duplicator, other)
    self.questions = duplicator.duplicate(other.questions)
  end
end
