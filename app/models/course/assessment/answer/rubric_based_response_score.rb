# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponseScore < ApplicationRecord
  validates :category_id, presence: true
  validates :score, numericality: { greater_than_or_equal_to: 0 }, allow_nil: true

  belongs_to :answer,
             class_name: 'Course::Assessment::Answer::RubricBasedResponse',
             inverse_of: :scores
  belongs_to :category,
             class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
             inverse_of: :scores
end
