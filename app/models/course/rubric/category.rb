# frozen_string_literal: true
# This table contains a DEPRECATED column: "is_bonus_category".
# v2 rubrics never have bonus categories (the migration and all v2 code build only non-bonus categories),
# so this column is always false and must NOT be read or written.
# "moderation" adjustment is now a frontend-only concept (see RubricModerationRow), not a category.
class Course::Rubric::Category < ApplicationRecord
  include Course::Rubric::CopyOnWriteConcern

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

  default_scope { order(:weight) }

  def initialize_duplicate(duplicator, other)
    self.criterions = duplicator.duplicate(other.criterions)
  end

  def self.build_from_v1(v1_category)
    Course::Rubric::Category.new(
      name: v1_category.name,
      criterions: v1_category.criterions.map { |c| Course::Rubric::Category::Criterion.build_from_v1(c) }
    )
  end

  # Builds an (unsaved) v2 category (with its criterions) straight from edit-page params, skipping any marked
  # for destruction. Copy-on-write rebuilds categories wholesale, so ids are ignored. Used by question types
  # that configure their rubric directly in v2 (e.g. forum-post questions).
  def self.build_from_params(category_params)
    criterions_params = Course::Rubric.nested_param_values(category_params[:criterions_attributes])
    Course::Rubric::Category.new(
      name: category_params[:name],
      criterions: criterions_params.reject { |c| ActiveRecord::Type::Boolean.new.cast(c[:_destroy]) }.
                  map { |c| Course::Rubric::Category::Criterion.build_from_params(c) }
    )
  end

  # Plain content tree for the rubric content_hash; criterions are ordered by grade. Mirrors the
  # migration's per-category structure (name + criterions), excluding weight.
  def canonical_content
    {
      name: name.to_s,
      criterions: criterions.sort_by { |criterion| criterion.grade.to_i }.map(&:canonical_content)
    }
  end

  private

  def validate_unique_grades_within_category
    existing_criterions = criterions.reject(&:marked_for_destruction?)
    return nil if existing_criterions.map(&:grade).uniq.length == existing_criterions.length

    errors.add(:criterions, :duplicate_grades_within_category)
  end

  def validate_at_least_one_grade
    existing_criterions = criterions.reject(&:marked_for_destruction?)
    return nil unless existing_criterions.empty?

    errors.add(:criterions, :at_least_one_grade)
  end

  def validate_grade_zero_exists
    all_criterions = criterions.reject(&:marked_for_destruction?).map(&:grade)
    return nil if all_criterions.include?(0)

    errors.add(:criterions, :grade_zero_missing)
  end
end
