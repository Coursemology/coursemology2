# frozen_string_literal: true
class Course::Assessment::Answer < ActiveRecord::Base
  include Workflow
  actable

  workflow do
    state :attempting do
      event :finalise, transitions_to: :submitted
    end
    # State where student officially indicates to submit the answer.
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :evaluate, transitions_to: :evaluated
      event :publish, transitions_to: :graded
    end
    # The state that has test case results but don't have a grade.
    # For manually graded assessments, this should be the default state after auto-grading service
    # is executed.
    state :evaluated do
      event :unsubmit, transitions_to: :attempting
      event :publish, transitions_to: :graded
      # Allows re-evaluations.
      event :evaluate, transitions_to: :evaluated
    end
    state :graded do
      event :unsubmit, transitions_to: :attempting
      # Does nothing but revert the state, for the case we want to keep the grading info
      event :unmark, transitions_to: :evaluated
      event :publish, transitions_to: :graded # To re-grade an answer.
      # Allows answers to be re-evaluated even after being graded. Useful if programming questions
      # get additional test cases.
      event :evaluate, transitions_to: :graded
    end
  end

  validate :validate_consistent_assessment
  validate :validate_assessment_state, if: :attempting?
  validates :submitted_at, presence: true, unless: :attempting?
  validates :submitted_at, :grade, :grader, :graded_at, absence: true, if: :attempting?
  validates :grade, :grader, :graded_at, presence: true, if: :graded?
  validate :validate_grade, unless: :attempting?

  belongs_to :submission, inverse_of: :answers
  belongs_to :question, class_name: Course::Assessment::Question.name, inverse_of: nil
  belongs_to :grader, class_name: User.name, inverse_of: nil
  has_one :auto_grading, class_name: Course::Assessment::Answer::AutoGrading.name,
                         dependent: :destroy, inverse_of: :answer, autosave: true

  accepts_nested_attributes_for :actable

  default_scope { order(:created_at) }

  scope :without_attempting_state, -> { where.not(workflow_state: :attempting) }

  # Autogrades the answer. This saves the answer if there are pending changes.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after auto grading job was
  #   finished.
  # @param [Boolean] reattempt Whether to create new answer based on current answer after grading.
  # @param [Boolean] reduce_priority Whether this answer should be queued at a lower priority.
  #   Used for regrading answers when question is changed, and for submission answers.
  # @return [Course::Assessment::Answer::AutoGradingJob|nil] The autograding job instance will be
  #   returned if the answer is graded using a job, nil will be returned if answer is graded inline.
  # @raise [IllegalStateError] When the answer has not been submitted.
  def auto_grade!(redirect_to_path: nil, reattempt: false, reduce_priority: false)
    raise IllegalStateError if attempting?

    ensure_auto_grading!
    if grade_inline?
      Course::Assessment::Answer::AutoGradingService.grade(self, reattempt)
      nil
    else
      auto_grading_job_class(reduce_priority).
        perform_later(self, redirect_to_path, reattempt).tap do |job|
          auto_grading.update_column(:job_id, job.job_id)
        end
    end
  end

  # Resets the answer by modifying the answer to the default.
  #
  # @return [Course::Assessment::Answer] The reset answer corresponding to the question. It is
  #   required that the {Course::Assessment::Answer#question} property be the same as +self+.
  # @raise [NotImplementedError] answer#reset_answer was not implemented.
  def reset_answer
    raise NotImplementedError unless actable.self_respond_to?(:reset_answer)
    actable.reset_answer
  end

  # Whether we should directly grade the answer in app server.
  #
  # @return [Boolean]
  def grade_inline?
    if actable.self_respond_to?(:grade_inline?)
      actable.grade_inline?
    else
      true
    end
  end

  protected

  def finalise
    self.submitted_at = Time.zone.now
  end

  def publish
    self.grade ||= 0
    self.grader = User.stamper || User.system
    self.graded_at = Time.zone.now
  end

  private

  def validate_consistent_assessment
    errors.add(:question, :consistent_assessment) if question.assessment != submission.assessment
  end

  def validate_assessment_state
    if !submission.attempting? && !submission.unsubmitting?
      errors.add(:submission, :attemptable_state)
    end
  end

  def validate_grade
    errors.add(:grade, :consistent_grade) if grade.present? && grade > question.maximum_grade
    errors.add(:grade, :non_negative_grade) if grade.present? && grade < 0
  end

  # Ensures that an auto grading record exists for this answer.
  #
  # Use this to guarantee that an auto grading record exists, and retrieves it. This is because
  # there can be a concurrent creation of such a record across two processes, and this can only
  # be detected at the database level.
  #
  # The additional transaction is in place because a RecordNotUnique will cause the active
  # transaction to be considered as errored, and needing a rollback.
  #
  # @return [Course::Assessment::Answer::AutoGrading]
  def ensure_auto_grading!
    ActiveRecord::Base.transaction(requires_new: true) do
      auto_grading || create_auto_grading!
    end
  rescue ActiveRecord::RecordInvalid, ActiveRecord::RecordNotUnique => e
    raise e if e.is_a?(ActiveRecord::RecordInvalid) && e.record.errors[:answer_id].empty?
    association(:auto_grading).reload
    auto_grading
  end

  def unsubmit
    self.grade = nil
    self.grader = nil
    self.graded_at = nil
    self.submitted_at = nil
    auto_grading.mark_for_destruction if auto_grading
  end

  def auto_grading_job_class(reduce_priority)
    if reduce_priority
      Course::Assessment::Answer::ReducePriorityAutoGradingJob
    else
      Course::Assessment::Answer::AutoGradingJob
    end
  end
end
