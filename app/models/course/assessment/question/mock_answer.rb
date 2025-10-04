# frozen_string_literal: true
class Course::Assessment::Question::MockAnswer < ApplicationRecord
  validates :question, presence: true

  belongs_to :question, inverse_of: :mock_answers
  has_many :rubric_evaluations, class_name: 'Course::Rubric::MockAnswerEvaluation',
                                dependent: :destroy, inverse_of: :mock_answer
end
