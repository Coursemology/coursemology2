# frozen_string_literal: true
# This table contains DEPRECATED columns: "custom_prompt" and "model_answer".
# In the v2 rubric structure, this data has been moved to the rubric itself (see Course::Rubric)
class Course::Assessment::Question::RubricBasedResponse < ApplicationRecord
  include DuplicationStateTrackingConcern

  acts_as :question, class_name: 'Course::Assessment::Question'

  validate :validate_no_reserved_category_names, unless: :duplicating?
  validate :validate_unique_category_names
  validate :validate_at_least_one_category

  has_many :categories, class_name: 'Course::Assessment::Question::RubricBasedResponseCategory',
                        dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  accepts_nested_attributes_for :categories, allow_destroy: true

  RESERVED_CATEGORY_NAMES = ['moderation'].freeze

  def initialize_duplicate(duplicator, other)
    set_duplication_flag
    copy_attributes(other)

    # active_rubric now lives on the polymorphic question; the dup'd acting_as carries the source's
    # active_rubric_id over, so replace it with a duplicate of the source rubric (these accessors proxy to
    # acting_as) so the new question owns its own (immutable) v2 rubric instead of sharing the source's.
    self.active_rubric = duplicator.duplicate(other.active_rubric)
    self.categories = duplicator.duplicate(other.categories)
  end

  def auto_gradable?
    !categories.empty? && ai_grading_enabled?
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
    if last_attempt
      answer.answer_text = last_attempt.answer_text
    else
      answer.answer_text = template_text unless template_text.blank?
    end

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
