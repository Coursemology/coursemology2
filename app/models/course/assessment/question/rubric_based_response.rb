# frozen_string_literal: true
class Course::Assessment::Question::RubricBasedResponse < ApplicationRecord
  acts_as :question, class_name: 'Course::Assessment::Question'

  validate :validate_no_reserved_category_names
  validate :validate_unique_category_names
  validate :validate_at_least_one_category

  has_many :categories, class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
                        dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :categories, allow_destroy: true

  RESERVED_CATEGORY_NAMES = ['moderation'].freeze

  def initialize_duplicate(duplicator, other)
    copy_attributes(other)

    self.categories = duplicator.duplicate(other.categories)
  end

  def auto_gradable?
    !categories.empty?
  end

  def auto_grader
    Course::Assessment::Answer::RubricAutoGradingService.new
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

  def csv_downloadable?
    true
  end

  def attempt(submission, last_attempt = nil)
    answer = Course::Assessment::Answer::RubricBasedResponse.new(submission: submission, question: question)
    answer.answer_text = last_attempt.answer_text if last_attempt

    answer.acting_as
  end

  private

  def validate_no_reserved_category_names
    reserved_names_count = categories.reject(&:marked_for_destruction?).map(&:name).count do |name|
      RESERVED_CATEGORY_NAMES.include?(name.downcase)
    end
    expected_count = new_record? ? 0 : 1
    errors.add(:categories, :reserved_category_name) if reserved_names_count > expected_count
  end

  def validate_unique_category_names
    non_bonus_categories = categories.reject do |cat|
      RESERVED_CATEGORY_NAMES.include?(cat.name.downcase) || cat.marked_for_destruction?
    end
    return nil if non_bonus_categories.map(&:name).uniq.length == non_bonus_categories.length

    errors.add(:categories, :duplicate_category_names)
  end

  def validate_at_least_one_category
    non_bonus_categories = categories.reject do |cat|
      RESERVED_CATEGORY_NAMES.include?(cat.name.downcase) || cat.marked_for_destruction?
    end
    return nil unless non_bonus_categories.empty?

    errors.add(:categories, :at_least_one_category)
  end
end
