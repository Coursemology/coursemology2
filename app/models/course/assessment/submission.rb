# frozen_string_literal: true
class Course::Assessment::Submission < ActiveRecord::Base
  include Workflow

  acts_as_experience_points_record
  include Course::Assessment::Submission::ExperiencePointsDisplayConcern

  after_save :auto_grade_submission, if: :submitted?

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
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: Course::Assessment::Answer::MultipleResponse.name
  has_many :text_response_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: Course::Assessment::Answer::TextResponse.name
  has_many :programming_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: Course::Assessment::Answer::Programming.name

  # @!attribute [r] graders
  #   The graders associated with this submission.
  has_many :graders, through: :answers, class_name: User.name

  accepts_nested_attributes_for :answers

  # @!attribute [r] submitted_at
  #   Gets the time the submission was submitted.
  #   @return [Time]
  calculated :submitted_at, (lambda do
    Course::Assessment::Answer.where do
      course_assessment_answers.submission_id == course_assessment_submissions.id
    end.select { max(course_assessment_answers.submitted_at) }
  end)

  # @!attribute [r] grade
  #   Gets the grade of the current submission.
  #   @return [Fixnum]
  calculated :grade, (lambda do
    Course::Assessment::Answer.where do
      course_assessment_answers.submission_id == course_assessment_submissions.id
    end.select { sum(course_assessment_answers.grade) }
  end)

  # @!attribute [r] graded_at
  #   Gets the time the submission was graded.
  #   @return [Time]
  calculated :graded_at, (lambda do
    Course::Assessment::Answer.where do
      course_assessment_answers.submission_id == course_assessment_submissions.id
    end.select { max(course_assessment_answers.graded_at) }
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

  # Creates an Auto Grading job for this submission. This saves the submission if there are pending
  # changes.
  #
  # @return [Course::Assessment::Submission::AutoGradingJob] The job instance.
  def auto_grade!
    AutoGradingJob.perform_later(self)
  end

  protected

  # Handles the finalisation of a submission.
  #
  # This finalises all the answers as well.
  def finalise(_ = nil)
    answers.select(&:attempting?).each(&:finalise!)
  end

  # Handles the grading of a submission.
  #
  # This grades all the answers as well.
  def publish(_ = nil)
    answers.each do |answer|
      answer.publish! if answer.submitted?
    end
  end

  private

  # Queues the submission for auto grading, after the submission has changed to the submitted state.
  def auto_grade_submission
    return unless workflow_state_changed?

    execute_after_commit do
      auto_grade!
    end
  end
end
