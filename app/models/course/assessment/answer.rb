class Course::Assessment::Answer < ActiveRecord::Base
  include Workflow
  actable

  workflow do
    state :attempting do
      event :finalise, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :publish, transitions_to: :graded
    end
    state :graded
  end

  validate :validate_consistent_assessment
  validate :validate_assessment_state, if: :attempting?
  validates :submitted_at, :grade, :grader, :graded_at, presence: true, unless: :attempting?
  validates :submitted_at, :grade, :grader, :graded_at, absence: true, if: :attempting?
  validate :validate_consistent_grade, unless: :attempting?

  belongs_to :submission, inverse_of: :answers
  belongs_to :question, class_name: Course::Assessment::Question.name, inverse_of: nil
  belongs_to :grader, class_name: User.name, inverse_of: nil
  has_one :auto_grading, class_name: Course::Assessment::Answer::AutoGrading.name,
                         inverse_of: :answer

  accepts_nested_attributes_for :actable

  protected

  def finalise
    update_attribute(:grade, 0)
    touch(:submitted_at)
  end

  def publish
    update_attribute(:grader_id, User.stamper.id)
    touch(:graded_at)
  end

  private

  def validate_consistent_assessment
    errors.add(:question, :consistent_assessment) if question.assessment != submission.assessment
  end

  def validate_assessment_state
    errors.add(:submission, :attemptable_state) unless submission.attempting?
  end

  def validate_consistent_grade
    errors.add(:grade, :consistent_grade) if grade.present? && grade > question.maximum_grade
  end
end
