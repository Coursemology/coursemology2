# frozen_string_literal: true
class Course::Rubric < ApplicationRecord
  include DuplicationStateTrackingConcern

  validate :validate_no_reserved_category_names, unless: :duplicating?
  validate :validate_unique_category_names
  validate :validate_at_least_one_category

  belongs_to :course, class_name: 'Course', inverse_of: :rubrics

  has_many :categories, class_name: 'Course::Rubric::Category',
                        dependent: :destroy, foreign_key: :rubric_id, inverse_of: :rubric

  has_many :question_rubrics, class_name: 'Course::Assessment::Question::QuestionRubric',
                              inverse_of: :rubric, dependent: :destroy
  has_many :questions, through: :question_rubrics, class_name: 'Course::Assessment::Question', source: :question

  has_many :answer_evaluations, class_name: 'Course::Rubric::AnswerEvaluation',
                                dependent: :destroy, foreign_key: :rubric_id, inverse_of: :rubric

  has_many :mock_answer_evaluations, class_name: 'Course::Rubric::MockAnswerEvaluation',
                                     dependent: :destroy, foreign_key: :rubric_id, inverse_of: :rubric

  accepts_nested_attributes_for :categories, allow_destroy: true

  default_scope { includes(categories: :criterions).order(created_at: :asc) }

  RESERVED_CATEGORY_NAMES = ['moderation'].freeze

  def initialize_duplicate(duplicator, other)
    set_duplication_flag
    copy_attributes(other)

    self.categories = duplicator.duplicate(other.categories)
  end

  def self.build_from_v1(v1_rubric_based_response_question, course)
    Course::Rubric.new(
      questions: [v1_rubric_based_response_question.acting_as],
      course: course,
      categories:
        v1_rubric_based_response_question.categories.without_bonus_category.map do |c|
          Course::Rubric::Category.build_from_v1(c)
        end,
      grading_prompt: v1_rubric_based_response_question.ai_grading_custom_prompt,
      model_answer: v1_rubric_based_response_question.ai_grading_model_answer
    )
  end

  # TODO: Explore smarter ways of generating rubric summaries.
  def summary
    grading_prompt.squish
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
