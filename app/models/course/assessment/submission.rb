class Course::Assessment::Submission < ActiveRecord::Base
  include Workflow
  acts_as_experience_points_record

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

  belongs_to :assessment, inverse_of: :submissions

  # @!attribute [r] answers
  #   The answers associated with this submission. There can be more than one answer per submission,
  #   this is because every answer is saved over time. Use the {.latest} scope of the answers if
  #   only the latest answer for each question is desired.
  has_many :answers, class_name: Course::Assessment::Answer.name, inverse_of: :submission do
    include Course::Assessment::Submission::AnswersConcern
  end
  has_many :multiple_response_answers,
           through: :answers, source: :actable,
           source_type: Course::Assessment::Answer::MultipleResponse.name

  has_many :text_response_answers,
           through: :answers, source: :actable,
           source_type: Course::Assessment::Answer::TextResponse.name

  accepts_nested_attributes_for :answers

  # @!method self.with_grade
  #   Includes the grade of the submission. This is the sum of the grades of all associated answers.
  scope :with_grade, (lambda do
    joins { answers.outer }.
      select { 'course_assessment_submissions.*' }.
      select { sum(answers.grade).as(grade) }.
      group { course_assessment_submissions.id }
  end)

  # @!method self.by_user(user)
  #   Finds all the submissions by the given user.
  #   @param [User] user The user to filter submissions by
  scope :by_user, (lambda do |user|
    joins { experience_points_record.course_user }.
      where { experience_points_record.course_user.user == user }
  end)

  # @!method self.ordered_by_date
  #   Orders the submissions by date of creation. This defaults to reverse chronological order
  #   (newest submission first).
  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  alias_method :finalise=, :finalise!
  alias_method :publish=, :publish!

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all the answers as well.
  def finalise(_ = nil)
    answers.each(&:finalise!)
  end

  # Handles the grading of a submission.
  #
  # This grades all the answers as well.
  def publish(_ = nil)
    answers.each(&:publish!)
  end
end
