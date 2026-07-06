# frozen_string_literal: true
class Course::Rubric::Category::Criterion < ApplicationRecord
  include Course::Rubric::CopyOnWriteConcern

  validates :grade, numericality: { greater_than_or_equal_to: 0, only_integer: true }, presence: true
  validates :category, presence: true

  belongs_to :category,
             class_name: 'Course::Rubric::Category',
             inverse_of: :criterions

  has_many :selections,
           class_name: 'Course::Rubric::AnswerEvaluation::Selection',
           foreign_key: :criterion_id, inverse_of: :criterion, dependent: :nullify

  has_many :mock_answer_selections,
           class_name: 'Course::Rubric::MockAnswerEvaluation::Selection',
           foreign_key: :criterion_id, inverse_of: :criterion, dependent: :nullify

  default_scope { order(grade: :asc) }

  def self.build_from_v1(v1_criterion)
    Course::Rubric::Category::Criterion.new(
      grade: v1_criterion.grade,
      explanation: v1_criterion.explanation
    )
  end

  # Builds an (unsaved) v2 criterion straight from edit-page params (used by question types that configure
  # their rubric directly in v2, e.g. forum-post questions).
  def self.build_from_params(criterion_params)
    Course::Rubric::Category::Criterion.new(
      grade: criterion_params[:grade],
      explanation: criterion_params[:explanation]
    )
  end

  # Plain content tree for the rubric content_hash. Mirrors the migration's per-criterion structure.
  def canonical_content
    { grade: grade.to_i, explanation: explanation.to_s }
  end

  def initialize_duplicate(duplicator, other)
    self.category = duplicator.duplicate(other.category)
  end
end
