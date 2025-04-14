# frozen_string_literal: true
class Course::Assessment::Answer::RubricBasedResponseSelection < ApplicationRecord
  validates :category_id, presence: true
  validates :grade, numericality: { only_numeric: true }, allow_nil: true

  belongs_to :answer,
             class_name: 'Course::Assessment::Answer::RubricBasedResponse',
             inverse_of: :selections
  belongs_to :category,
             class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
             inverse_of: :selections
  belongs_to :criterion,
             class_name: 'Course::Assessment::Question::RubricBasedResponseCriterion',
             foreign_key: :criterion_id, inverse_of: :selections, optional: true
end
