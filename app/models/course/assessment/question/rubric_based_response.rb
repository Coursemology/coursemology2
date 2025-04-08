# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponse < ApplicationRecord
  acts_as :question, class_name: 'Course::Assessment::Question'

  validate :validate_unique_category_names
  validate :validate_category_score
  validate :validate_at_least_one_category

  has_many :categories, class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
                        dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :categories, allow_destroy: true

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    self.categories = duplicator.duplicate(other.categories)
  end

  def question_type
    'RubricBasedResponse'
  end

  def question_type_readable
    I18n.t('activerecord.attributes.models.course/assessment/question/rubric_based_response.rubric_based_response')
  end

  def history_viewable?
    true
  end

  private

  def validate_unique_category_names
    return nil if categories.map(&:name).uniq.length == categories.length

    errors.add(:categories, :duplicate_category_names)
  end

  def validate_category_score
    return nil if categories.all? { |c| c.maximum_score <= maximum_grade }

    errors.add(:maximum_grade, :invalid_grade)
  end

  def validate_at_least_one_category
    return nil unless categories.empty?

    errors.add(:categories, :at_least_one_category)
  end
end
