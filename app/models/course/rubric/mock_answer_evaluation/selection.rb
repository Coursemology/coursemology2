# frozen_string_literal: true
class Course::Rubric::MockAnswerEvaluation::Selection < ApplicationRecord
  validates :category_id, presence: true

  belongs_to :mock_answer_evaluation,
             class_name: 'Course::Rubric::MockAnswerEvaluation',
             inverse_of: :selections
  belongs_to :category,
             class_name: 'Course::Rubric::Category',
             inverse_of: :mock_answer_selections
  belongs_to :criterion,
             class_name: 'Course::Rubric::Category::Criterion',
             inverse_of: :mock_answer_selections
end
