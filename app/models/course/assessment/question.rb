# frozen_string_literal: true
class Course::Assessment::Question < ApplicationRecord # rubocop:disable Metrics/ClassLength
  include Course::SanitizeDescriptionConcern

  actable optional: true
  has_many_attachments

  # How this question is graded. 'default' = the question type's own grading; 'rubric' = graded against
  # active_rubric via the v2 pipeline. String-backed + prefixed so future modes need no schema change and
  # predicates read as grading_mode_rubric? etc.
  enum :grading_mode, { default: 'default', rubric: 'rubric' }, prefix: true

  # New questions default to their type's first supported mode (so e.g. RBR becomes 'rubric' on create,
  # regardless of the column default) unless the caller already set a supported mode.
  before_validation :apply_default_grading_mode, on: :create

  validates :actable_type, length: { maximum: 255 }, allow_nil: true
  validate :validate_grading_mode_supported
  validates :title, length: { maximum: 255 }, allow_nil: true
  validates :maximum_grade, numericality: { greater_than_or_equal_to: 0, less_than: 1000 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :actable_type, uniqueness: { scope: [:actable_id],
                                         if: -> { actable_id? && actable_type_changed? } }
  validates :actable_id, uniqueness: { scope: [:actable_type],
                                       if: -> { actable_type? && actable_id_changed? } }
  validates :is_low_priority, inclusion: { in: [true, false] }

  has_many :question_assessments, class_name: 'Course::QuestionAssessment', inverse_of: :question,
                                  dependent: :destroy
  has_many :answers, class_name: 'Course::Assessment::Answer', dependent: :destroy,
                     inverse_of: :question
  has_many :submission_questions, class_name: 'Course::Assessment::SubmissionQuestion',
                                  dependent: :destroy, inverse_of: :question
  has_many :question_bundle_questions, class_name: 'Course::Assessment::QuestionBundleQuestion',
                                       foreign_key: :question_id, dependent: :destroy, inverse_of: :question
  has_many :question_bundles, through: :question_bundle_questions, class_name: 'Course::Assessment::QuestionBundle'
  has_many :live_feedbacks, class_name: 'Course::Assessment::LiveFeedback',
                            dependent: :destroy, inverse_of: :question
  has_many :question_rubrics, class_name: 'Course::Assessment::Question::QuestionRubric',
                              dependent: :destroy, inverse_of: :question
  has_many :rubrics, through: :question_rubrics, class_name: 'Course::Rubric', source: :rubric
  # The v2 Course::Rubric this question is currently graded against (copy-on-write target). Lives on the
  # polymorphic question -- not the RubricBasedResponse actable -- so rubric grading can extend to other
  # question types; null for questions without an active rubric (e.g. every non-RBR question).
  belongs_to :active_rubric, class_name: 'Course::Rubric', optional: true, inverse_of: false
  has_many :mock_answers, class_name: 'Course::Assessment::Question::MockAnswer',
                          dependent: :destroy, inverse_of: :question

  # Context sources this question pulls into its rubric grading prompt. On the polymorphic question so any
  # rubric-graded type can carry them; deleting the consumer question cascades these (DB FK).
  has_many :grading_contexts, class_name: 'Course::Assessment::Question::GradingContext',
                              dependent: :destroy, foreign_key: :question_id, inverse_of: :question

  # A polymorphic source has no DB FK, so when a question that OTHER questions reference as a context source
  # is destroyed, clear those dangling context rows app-side.
  after_destroy :clear_dependent_grading_contexts

  delegate :to_partial_path, to: :actable
  delegate :question_type, to: :actable
  delegate :question_type_readable, to: :actable

  # Bulk query scope for retrieving all questions with plagiarism check.
  # Currently, this is only for programming questions.
  scope :plagiarism_checkable, -> { where(actable_type: Course::Assessment::Question::Programming.name) }

  # Checks if the given question is auto gradable. This defaults to false if the specific
  # question does not implement auto grading. If this returns true, +auto_grader+ is guaranteed
  # to return a valid grader service.
  #
  # Different instances of a question can have different auto gradability.
  #
  # @return [Boolean] True if the question supports auto grading.
  def auto_gradable?
    (actable.present? && actable.self_respond_to?(:auto_gradable?)) ? actable.auto_gradable? : false
  end

  # Gets an instance of the auto grader suitable for use with this question.
  #
  # @return [Course::Assessment::Answer::AutoGradingService] An auto grading service.
  # @raise [NotImplementedError] The question does not have a suitable auto grader for use.
  def auto_grader
    raise NotImplementedError unless auto_gradable? && actable.self_respond_to?(:auto_grader)

    actable.auto_grader || (raise NotImplementedError)
  end

  # The grading modes this question's type supports (see grading_mode).
  # Defaults to ['default'], which covers grading modes that don't fit a specific method yet.
  # A type with a single supported mode has a fixed grading_mode (the frontend renders no switch).
  def supported_grading_modes
    actable&.self_respond_to?(:supported_grading_modes) ? actable.supported_grading_modes : ['default']
  end

  # Whether this question's answers can serve as grading context for OTHER questions (the sibling-answer
  # provider). True for types that expose meaningful answer text (see Answer#grading_context_text).
  def provides_grading_context?
    actable&.self_respond_to?(:provides_grading_context?) ? actable.provides_grading_context? : false
  end

  # The grading-context provider kinds selectable on THIS question's edit page (see GradingContext). Empty
  # for types that cannot pull context. Delegated to the actable type.
  def available_grading_context_types
    actable&.self_respond_to?(:available_grading_context_types) ? actable.available_grading_context_types : []
  end

  # Builds the answer adapter that writes rubric auto-grading results for +answer+ against +rubric+.
  # Delegates to the actable type -- each rubric-gradable type supplies its own (they differ only in the
  # text handed to the LLM). Only called for rubric-graded questions (see RubricAutoGradingService).
  def rubric_answer_adapter(answer, rubric)
    actable.rubric_answer_adapter(answer, rubric)
  end

  # Attempts the given question in the submission. This builds a new answer for the current
  # question.
  #
  # @param [Course::Assessment::Submission] submission The submission which the answer should
  #   belong to.
  # @param [Course::Assessment::Answer|nil] last_attempt If last_attempt is given, fields in the
  #   new answer will be pre-populated with data from it.
  # @return [Course::Assessment::Answer] The answer corresponding to the question. It is required
  #   that the {Course::Assessment::Answer#question} property be the same as +self+. The result
  #   should not be persisted.
  # @raise [NotImplementedError] question#attempt was not implemented.
  def attempt(submission, last_attempt = nil)
    if actable&.self_respond_to?(:attempt)
      return actable.attempt(submission, last_attempt ? last_attempt.actable : nil)
    end

    raise NotImplementedError, 'Questions must implement the #attempt method for submissions.'
  end

  # Test if the question is the last question of the assessment.
  #
  # @return [Boolean] True if the question is the last question, otherwise False.
  def last_question?
    assessment.questions.last == self
  end

  # Whether the answer has downloadable content as a raw file, to be zipped and downloaded.
  #
  # @return [Boolean]
  def files_downloadable?
    if actable.self_respond_to?(:files_downloadable?)
      actable.files_downloadable?
    else
      false
    end
  end

  # Whether the answer has downloadable content in csv format.
  #
  # @return [Boolean]
  def csv_downloadable?
    if actable.self_respond_to?(:csv_downloadable?)
      actable.csv_downloadable?
    else
      false
    end
  end

  # Whether the answer history is viewable.
  #
  # @return [Boolean]
  def history_viewable?
    if actable.self_respond_to?(:history_viewable?)
      actable.history_viewable?
    else
      false
    end
  end

  # Whether the question has plagiarism check.
  # Currently, this is only for programming questions.
  #
  # @return [Boolean]
  def plagiarism_checkable?
    if actable.self_respond_to?(:plagiarism_checkable?)
      actable.plagiarism_checkable?
    else
      false
    end
  end

  # Copy attributes for question from the object being duplicated.
  #
  # @param other [Object] The source object to copy attributes from.
  def copy_attributes(other)
    self.title = other.title
    self.description = other.description
    self.staff_only_comments = other.staff_only_comments
    self.maximum_grade = other.maximum_grade

    # we do creation of Koditsu question on-demand, which means that the association
    # between "other" and its Koditsu question is not carried over by duplication
    # once the duplication succeeds, then Koditsu question will be created for the
    # duplication only if it's necessary, i.e. if the assessment related to it is
    # a Koditsu assessment
    self.koditsu_question_id = nil
    self.is_synced_with_koditsu = false
  end

  private

  def apply_default_grading_mode
    return if supported_grading_modes.include?(grading_mode)

    self.grading_mode = supported_grading_modes.first
  end

  def validate_grading_mode_supported
    return if supported_grading_modes.include?(grading_mode)

    errors.add(:grading_mode, :unsupported)
  end

  def clear_dependent_grading_contexts
    Course::Assessment::Question::GradingContext.where(source: self).delete_all
  end
end
