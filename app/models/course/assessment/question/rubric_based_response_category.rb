# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponseCategory < ApplicationRecord
  validates :question, presence: true

  validate :validate_unique_grades_within_category
  validate :validate_at_least_one_grade
  validate :validate_grade_zero_exists

  belongs_to :question,
             class_name: 'Course::Assessment::Question::RubricBasedResponse',
             inverse_of: :categories

  has_many :criterions, class_name: 'Course::Assessment::Question::RubricBasedResponseCriterion',
                        dependent: :destroy, foreign_key: :category_id, inverse_of: :category
  has_many :selections, class_name: 'Course::Assessment::Answer::RubricBasedResponseSelection',
                        dependent: :destroy, foreign_key: :category_id, inverse_of: :category

  accepts_nested_attributes_for :criterions, allow_destroy: true

  default_scope { order(Arel.sql('is_bonus_category ASC'), name: :asc) }

  scope :without_bonus_category, -> { where(is_bonus_category: false) }

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
    self.criterions = duplicator.duplicate(other.criterions)
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
