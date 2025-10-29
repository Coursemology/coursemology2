# frozen_string_literal: true
class Course::Rubric::Category < ApplicationRecord
  validates :rubric, presence: true

  validate :validate_unique_grades_within_category
  validate :validate_at_least_one_grade
  validate :validate_grade_zero_exists

  belongs_to :rubric,
             class_name: 'Course::Rubric',
             inverse_of: :categories

  has_many :criterions, class_name: 'Course::Rubric::Category::Criterion',
                        dependent: :destroy, foreign_key: :category_id, inverse_of: :category
  has_many :selections, class_name: 'Course::Rubric::AnswerEvaluation::Selection',
                        dependent: :destroy, foreign_key: :category_id, inverse_of: :category
  has_many :mock_answer_selections, class_name: 'Course::Rubric::MockAnswerEvaluation::Selection',
                                    dependent: :destroy, foreign_key: :category_id, inverse_of: :category

  accepts_nested_attributes_for :criterions, allow_destroy: true

  default_scope { order(Arel.sql('is_bonus_category ASC')) }

  scope :without_bonus_category, -> { where(is_bonus_category: false) }

  def initialize_duplicate(duplicator, other)
    self.criterions = duplicator.duplicate(other.criterions)
  end

  def self.build_from_v1(v1_category)
    Course::Rubric::Category.new(
      name: v1_category.name,
      is_bonus_category: v1_category.is_bonus_category,
      criterions: v1_category.criterions.map { |c| Course::Rubric::Category::Criterion.build_from_v1(c) }
    )
  end

  private

  def validate_unique_grades_within_category
    existing_criterions = criterions.reject(&:marked_for_destruction?)
    return nil if existing_criterions.map(&:grade).uniq.length == existing_criterions.length

    errors.add(:criterions, :duplicate_grades_within_category)
  end

  def validate_at_least_one_grade
    existing_criterions = criterions.reject(&:marked_for_destruction?)
    return nil if is_bonus_category || !existing_criterions.empty?

    errors.add(:criterions, :at_least_one_grade)
  end

  def validate_grade_zero_exists
    all_criterions = criterions.reject(&:marked_for_destruction?).map(&:grade)
    return nil if is_bonus_category || all_criterions.include?(0)

    errors.add(:criterions, :grade_zero_missing)
  end
end
