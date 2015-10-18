class Course::Assessment::Answer < ActiveRecord::Base
  include Workflow
  actable

  workflow do
    state :attempting do
      event :submit, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :grade, transitions_to: :graded
    end
    state :graded
  end

  validate :validate_consistent_assessment
  validates :grade, presence: true, unless: :attempting?
  validates :grade, absence: true, if: :attempting?

  belongs_to :submission, inverse_of: :answers
  belongs_to :question, class_name: Course::Assessment::Question.name, inverse_of: nil

  accepts_nested_attributes_for :actable

  protected

  def submit
    update_attribute(:grade, 0)
  end

  private

  def validate_consistent_assessment
    errors.add(:question, :consistent_assessment) if question.assessment != submission.assessment
  end
end
