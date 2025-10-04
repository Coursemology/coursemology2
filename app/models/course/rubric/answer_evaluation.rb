# frozen_string_literal: true
class Course::Rubric::AnswerEvaluation < ApplicationRecord
  validates :answer, presence: true
  validates :rubric, presence: true

  belongs_to :answer, class_name: 'Course::Assessment::Answer', inverse_of: :rubric_evaluations
  belongs_to :rubric, class_name: 'Course::Rubric', inverse_of: :answer_evaluations

  has_many :selections,
           class_name: 'Course::Rubric::AnswerEvaluation::Selection',
           foreign_key: :answer_evaluation_id, inverse_of: :criterion, dependent: :destroy
end
