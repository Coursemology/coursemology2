# frozen_string_literal: true
class Course::Rubric < ApplicationRecord # rubocop:disable Metrics/ClassLength
  include DuplicationStateTrackingConcern
  include Course::Rubric::CopyOnWriteConcern

  # Materialise category display order into the weight column, then fingerprint the content. Both run
  # only on create -- rubrics are copy-on-write, so the digest is computed once and never mutated.
  # Weights must be assigned before any code relies on them for display ordering.
  before_validation :assign_category_weights, :assign_content_hash, on: :create

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
    # grading_prompt/model_answer are carried by #dup; content_hash is recomputed on save. Re-home the
    # rubric to the destination course (cross-course/instance duplication) and deep-copy its categories
    # in weight order so the duplicate preserves the source's content (and therefore its content_hash).
    self.course = duplicator.options[:destination_course] || duplicator.options[:current_course]
    self.categories = duplicator.duplicate(other.categories.sort_by(&:weight))
  end

  def self.build_from_v1(v1_rubric_based_response_question, course)
    Course::Rubric.new(
      questions: [v1_rubric_based_response_question.acting_as],
      course: course,
      categories: categories_from_v1(v1_rubric_based_response_question),
      grading_prompt: v1_rubric_based_response_question.ai_grading_custom_prompt,
      model_answer: v1_rubric_based_response_question.ai_grading_model_answer
    )
  end

  # Builds (unsaved) v2 categories from a v1 question's non-bonus categories, in their display order
  # (the v1 default scope orders by name), so the resulting weights mirror what the user sees.
  def self.categories_from_v1(v1_rubric_based_response_question)
    v1_rubric_based_response_question.categories.without_bonus_category.map do |category|
      Course::Rubric::Category.build_from_v1(category)
    end
  end

  # Copy-on-write entry point: returns +self+ when nothing changed, otherwise a newly persisted rubric
  # carrying the same question links. Categories default to a deep copy of the current ones (e.g. when only
  # the prompt changes); pass +categories+ to replace them wholesale. Because the content_hash no longer
  # covers grading_prompt/model_answer, those are compared explicitly so a prompt-only edit still versions.
  def copy_with(grading_prompt: self.grading_prompt, model_answer: self.model_answer, categories: nil)
    proposed = self.class.new(
      course: course,
      grading_prompt: grading_prompt,
      model_answer: model_answer,
      categories: categories || duplicate_categories
    )
    proposed.assign_category_weights
    if proposed.canonical_content_hash == content_hash &&
       grading_prompt.to_s == self.grading_prompt.to_s &&
       model_answer.to_s == self.model_answer.to_s
      return self
    end

    proposed.questions = questions
    proposed.save!
    proposed
  end

  # Whether +other+ is structurally incompatible with this rubric -- i.e. its categories/criterions differ,
  # so carrying grades across them (see GradingEvaluationAdvanceService) may lose some data. Equal
  # content_hash ⇒ compatible (grades map across without loss).
  def incompatible_with?(other)
    content_hash != other.content_hash
  end

  # Structural fingerprint used for the content_hash: category/criterion content only, ORDER-INDEPENDENT
  # (categories sorted by name, criterions by grade). grading_prompt and model_answer are deliberately NOT
  # part of the hash -- it answers "are two revisions structurally compatible for carrying grades forward?".
  # MUST match the migration's #content_hash_for so equal content hashes equal. (v2 rubrics have no bonus
  # categories.)
  def canonical_content
    categories.sort_by { |category| category.name.to_s }.map(&:canonical_content)
  end

  # Persists the in-memory category order into the weight column (weight = position). Public so
  # #copy_with can prepare a proposed rubric for hashing before it is validated/saved.
  def assign_category_weights
    categories.each_with_index { |category, index| category.weight = index }
  end

  # TODO: Explore smarter ways of generating rubric summaries.
  def summary
    grading_prompt.squish
  end

  private

  def assign_content_hash
    self.content_hash = canonical_content_hash
  end

  def duplicate_categories
    categories.map do |category|
      Course::Rubric::Category.new(
        name: category.name, weight: category.weight,
        criterions: category.criterions.map do |criterion|
          Course::Rubric::Category::Criterion.new(grade: criterion.grade, explanation: criterion.explanation)
        end
      )
    end
  end

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
