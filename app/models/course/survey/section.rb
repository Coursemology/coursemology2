# frozen_string_literal: true
class Course::Survey::Section < ApplicationRecord
  validates :title, length: { maximum: 255 }, presence: true
  validates :weight, numericality: { only_integer: true }, presence: true
  validates :survey, presence: true

  belongs_to :survey, inverse_of: :sections
  has_many :questions, inverse_of: :section, dependent: :destroy

  def initialize_duplicate(duplicator, other)
    self.questions = duplicator.duplicate(other.questions)
  end
end
