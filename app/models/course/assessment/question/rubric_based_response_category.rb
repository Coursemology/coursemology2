# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponseCategory < ApplicationRecord
  validates :maximum_score, numericality: { greater_than_or_equal_to: 0, only_integer: true }, presence: true
  validates :question, presence: true

  validate :validate_unique_levels_within_category
  validate :validate_at_least_one_level
  validate :validate_level_zero_and_maximum_score_exists
  validate :validate_no_level_higher_than_maximum_score

  belongs_to :question,
             class_name: 'Course::Assessment::Question::RubricBasedResponse',
             inverse_of: :categories

  has_many :levels, class_name: 'Course::Assessment::Question::RubricBasedResponseLevel',
                    dependent: :destroy, foreign_key: :category_id, inverse_of: :category
  has_many :scores, class_name: 'Course::Assessment::Answer::RubricBasedResponseScore',
                    dependent: :destroy, foreign_key: :category_id, inverse_of: :category

  accepts_nested_attributes_for :levels, allow_destroy: true

  default_scope { order(name: :asc) }

  scope :without_bonus_category, -> { where(is_bonus_category: false) }

  def initialize_duplicate(duplicator, other)
    self.question = duplicator.duplicate(other.question)
    self.levels = duplicator.duplicate(other.levels)
  end

  private

  def validate_unique_levels_within_category
    return nil if levels.map(&:level).uniq.length == levels.length

    errors.add(:levels, :duplicate_levels_within_category)
  end

  def validate_at_least_one_level
    return nil if is_bonus_category || !levels.empty?

    errors.add(:levels, :at_least_one_level)
  end

  def validate_level_zero_and_maximum_score_exists
    all_levels = levels.map(&:level)
    return nil if is_bonus_category || (all_levels.include?(0) && all_levels.include?(maximum_score))

    errors.add(:levels, :level_zero_or_maximum_score_missing)
  end

  def validate_no_level_higher_than_maximum_score
    return nil if levels.all? { |level| level.level <= maximum_score }

    errors.add(:levels, :level_higher_than_maximum_score)
  end
end
