# frozen_string_literal: true
class Course::Rubric::Category::Criterion < ApplicationRecord
  validates :grade, numericality: { greater_than_or_equal_to: 0, only_integer: true }, presence: true
  validates :category, presence: true

  belongs_to :category,
             class_name: 'Course::Rubric::Category',
             inverse_of: :criterions

  has_many :selections,
           class_name: 'Course::Rubric::AnswerEvaluation::Selection',
           foreign_key: :criterion_id, inverse_of: :criterion, dependent: :nullify

  default_scope { order(grade: :asc) }

  def self.build_from_v1(v1_criterion)
    Course::Rubric::Category::Criterion.new(
      grade: v1_criterion.grade,
      explanation: v1_criterion.explanation
    )
  end

  def initialize_duplicate(duplicator, other)
    self.category = duplicator.duplicate(other.category)
  end
end
