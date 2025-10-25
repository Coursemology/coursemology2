# frozen_string_literal: true
class Course::Rubric::MockAnswerEvaluation < ApplicationRecord
  validates :mock_answer, presence: true
  validates :rubric, presence: true

  belongs_to :mock_answer, class_name: 'Course::Assessment::Question::MockAnswer', inverse_of: :rubric_evaluations
  belongs_to :rubric, class_name: 'Course::Rubric', inverse_of: :mock_answer_evaluations

  has_many :selections,
           class_name: 'Course::Rubric::MockAnswerEvaluation::Selection',
           foreign_key: :mock_answer_evaluation_id, inverse_of: :mock_answer_evaluation, dependent: :destroy
end
