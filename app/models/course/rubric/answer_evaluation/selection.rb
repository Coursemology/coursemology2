# frozen_string_literal: true
class Course::Rubric::AnswerEvaluation::Selection < ApplicationRecord
  validates :category_id, presence: true

  belongs_to :answer_evaluation,
             class_name: 'Course::Rubric::AnswerEvaluation',
             inverse_of: :selections
  belongs_to :category,
             class_name: 'Course::Rubric::Category',
             inverse_of: :selections
  belongs_to :criterion,
             class_name: 'Course::Rubric::Category::Criterion',
             inverse_of: :selections
end
