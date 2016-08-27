# frozen_string_literal: true
class Course::Assessment::Answer < ActiveRecord::Base
  include Workflow
  actable
  acts_as_discussion_topic display_globally: true

  workflow do
    state :attempting do
      event :finalise, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :publish, transitions_to: :graded
    end
    state :graded do
      event :unsubmit, transitions_to: :attempting
      event :publish, transitions_to: :graded # To re-grade an answer.
    end
  end

  validate :validate_consistent_assessment
  validate :validate_assessment_state, if: :attempting?
  validates :submitted_at, :grade, presence: true, unless: :attempting?
  validates :submitted_at, :grade, :grader, :graded_at, absence: true, if: :attempting?
  validates :grader, :graded_at, presence: true, if: :graded?
  validate :validate_consistent_grade, unless: :attempting?

  belongs_to :submission, inverse_of: :answers
  belongs_to :question, class_name: Course::Assessment::Question.name, inverse_of: nil
  belongs_to :grader, class_name: User.name, inverse_of: nil
  has_one :auto_grading, class_name: Course::Assessment::Answer::AutoGrading.name,
                         dependent: :destroy, inverse_of: :answer, autosave: true

  accepts_nested_attributes_for :actable
  accepts_nested_attributes_for :discussion_topic

  after_initialize :set_course, if: :new_record?
  before_validation :set_course, if: :new_record?

  default_scope { order(:created_at) }

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    joins { submission }.
      where { submission.creator_id >> user_id }.
      joins { discussion_topic }.select { discussion_topic.id }
  end)

  # Creates an Auto Grading job for this answer. This saves the answer if there are pending changes.
  #
  # @param [String|nil] redirect_to_path The path to be redirected after auto grading job was
  #   finished.
  # @param [Boolean] reattempt Whether to create new answer based on current answer after grading.
  # @return [Course::Assessment::Answer::AutoGradingJob] The job instance.
  # @raise [ArgumentError] When the question cannot be auto graded.
  # @raise [IllegalStateError] When the answer has not been submitted.
  def auto_grade!(redirect_to_path = nil, reattempt = false)
    raise ArgumentError unless question.auto_gradable?
    raise IllegalStateError if attempting?

    ensure_auto_grading!
    Course::Assessment::Answer::AutoGradingJob.
      perform_later(self, redirect_to_path, reattempt).tap do |job|
      auto_grading.update_column(:job_id, job.job_id)
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

  protected

  def finalise
    self.grade = 0
    self.submitted_at = Time.zone.now
  end

  def publish
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

  def validate_consistent_grade
    errors.add(:grade, :consistent_grade) if grade.present? && grade > question.maximum_grade
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
    raise ActiveRecord::Rollback if e.is_a?(ActiveRecord::RecordInvalid) && e.record.errors[:answer_id].empty?
    association(:auto_grading).reload
    auto_grading
  end

  # Set the course as the same course of the assessment.
  def set_course
    self.course ||= submission.assessment.course if submission && submission.assessment
  end

  def unsubmit
    self.grade = nil
    self.grader = nil
    self.graded_at = nil
    self.submitted_at = nil
    auto_grading.mark_for_destruction if auto_grading
  end
end
