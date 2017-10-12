# frozen_string_literal: true
class Course::Assessment::Submission < ApplicationRecord
  include Workflow
  include Course::Assessment::Submission::WorkflowEventConcern
  include Course::Assessment::Submission::TodoConcern

  acts_as_experience_points_record

  after_save :auto_grade_submission, if: :submitted?
  after_save :send_submit_notification, if: :submitted?
  after_create :send_attempt_notification

  workflow do
    state :attempting do
      event :finalise, transitions_to: :submitted
    end
    state :submitted do
      event :unsubmit, transitions_to: :attempting
      event :mark, transitions_to: :graded
      event :publish, transitions_to: :published
    end
    state :graded do
      # Revert to submitted state but keep the grading info.
      event :unmark, transitions_to: :submitted
      event :publish, transitions_to: :published
    end
    state :published do
      event :unsubmit, transitions_to: :attempting
    end
  end

  schema_validations except: [:creator_id, :assessment_id]
  validate :validate_consistent_user, :validate_unique_submission, on: :create
  validate :validate_awarded_attributes, if: :published?
  validates :submitted_at, presence: true, unless: :attempting?

  belongs_to :assessment, inverse_of: :submissions

  has_many :submission_questions, class_name: Course::Assessment::SubmissionQuestion.name,
                                  dependent: :destroy, inverse_of: :submission

  # @!attribute [r] answers
  #   The answers associated with this submission. There can be more than one answer per submission,
  #   this is because every answer is saved over time. Use the {.latest} scope of the answers if
  #   only the latest answer for each question is desired.
  has_many :answers, class_name: Course::Assessment::Answer.name, dependent: :destroy,
                     inverse_of: :submission do
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
  has_many :scribing_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: Course::Assessment::Answer::Scribing.name

  # @!attribute [r] graders
  #   The graders associated with this submission.
  has_many :graders, through: :answers, class_name: User.name

  belongs_to :publisher, class_name: User.name, inverse_of: nil

  has_many :logs, class_name: Course::Assessment::Submission::Log.name,
                  inverse_of: :submission, dependent: :destroy

  accepts_nested_attributes_for :answers

  # @!attribute [r] graded_at
  #   Gets the time the submission was graded.
  #   @return [Time]
  calculated :graded_at, (lambda do
    Course::Assessment::Answer.unscope(:order).
      where('course_assessment_answers.submission_id = course_assessment_submissions.id').
      select('max(course_assessment_answers.graded_at)')
  end)

  # @!attribute [r] log_count
  #   Returns the total number of access logs for the submission.
  calculated :log_count, (lambda do
    Course::Assessment::Submission::Log.select("count('*')").
      where('course_assessment_submission_logs.submission_id = course_assessment_submissions.id')
  end)

  # @!method self.by_user(user)
  #   Finds all the submissions by the given user.
  #   @param [User] user The user to filter submissions by
  scope :by_user, ->(user) { where(creator: user) }

  # @!method self.by_users(user)
  #   @param [Integer|Array<Integer>] user_ids The user ids to filter submissions by
  scope :by_users, ->(user_ids) { where(creator_id: user_ids) }

  # @!method self.from_category(category)
  #   Finds all the submissions in the given category.
  #   @param [Course::Assessment::Category] category The category to filter submissions by
  scope :from_category, (lambda do |category|
    where(assessment_id: category.assessments.select(:id))
  end)

  scope :from_course, (lambda do |course|
    joins(assessment: { tab: :category }).
      where('course_assessment_categories.course_id = ?', course.id)
  end)

  scope :from_group, (lambda do |group_id|
    joins(experience_points_record: { course_user: :groups }).
      where('course_groups.id IN (?)', group_id)
  end)

  # @!method self.ordered_by_date
  #   Orders the submissions by date of creation. This defaults to reverse chronological order
  #   (newest submission first).
  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  # @!method self.ordered_by_submitted date
  #   Orders the submissions by date of submission (newest submission first).
  scope :ordered_by_submitted_date, -> { order(submitted_at: :desc) }

  # @!method self.confirmed
  #   Returns submissions which have been submitted (which may or may not be graded).
  scope :confirmed, -> { where(workflow_state: [:submitted, :graded, :published]) }

  scope :pending_for_grading, (lambda do
    where(workflow_state: [:submitted, :graded]).
      joins(:assessment).
      where('course_assessments.autograded = ?', false)
  end)

  # Filter submissions by category_id, assessment_id, group_id and/or user_id (creator)
  scope :filter, (lambda do |filter_params|
    result = all
    if filter_params[:category_id].present?
      result = result.from_category(Course::Assessment::Category.find(filter_params[:category_id]))
    end
    if filter_params[:assessment_id].present?
      result = result.where(assessment_id: filter_params[:assessment_id])
    end
    result = result.from_group(filter_params[:group_id]) if filter_params[:group_id].present?
    result = result.by_user(filter_params[:user_id]) if filter_params[:user_id].present?
    result
  end)

  alias_method :finalise=, :finalise!
  alias_method :mark=, :mark!
  alias_method :unmark=, :unmark!
  alias_method :publish=, :publish!
  alias_method :unsubmit=, :unsubmit!

  # Creates an Auto Grading job for this submission. This saves the submission if there are pending
  # changes.
  #
  # @return [Course::Assessment::Submission::AutoGradingJob] The job instance.
  def auto_grade!
    AutoGradingJob.perform_later(self)
  end

  def unsubmitting?
    !!@unsubmitting
  end

  # The total grade of the submission
  def grade
    current_answers.map { |a| a.grade || 0 }.sum
  end

  # The answers with current_answer flag set to true.
  #
  # If there are multiple current_answers for a particular question, return the first one.
  # This guards against a race condition creating multiple current_answers for a given
  # question in load_or_create_answers.
  def current_answers
    answers.select(&:current_answer?).group_by(&:question_id).map { |pair| pair[1].first }
  end

  # Returns all graded answers of the question in current submission.
  def evaluated_or_graded_answers(question)
    answers.select { |a| a.question_id == question.id && (a.evaluated? || a.graded?) }
  end

  # Return the points awarded for the submission.
  # If submission is 'graded', return the draft value, otherwise, the return the points awarded.
  def current_points_awarded
    published? ? points_awarded : draft_points_awarded
  end

  private

  # Queues the submission for auto grading, after the submission has changed to the submitted state.
  def auto_grade_submission
    return unless workflow_state_changed?

    execute_after_commit do
      auto_grade!
    end
  end

  # Validate that the submission creator is the same user as the course_user in the associated
  # experience_points_record.
  def validate_consistent_user
    return if course_user && course_user.user == creator
    errors.add(:experience_points_record, :inconsistent_user)
  end

  # Validate that the submission creator does not have an existing submission for this assessment.
  def validate_unique_submission
    existing = Course::Assessment::Submission.find_by(assessment_id: assessment.id,
                                                      creator_id: creator.id)
    return unless existing
    errors.clear
    errors[:base] << I18n.t('activerecord.errors.models.course/assessment/'\
                            'submission.submission_already_exists')
  end

  # Validate that the awarder and awarded_at is present for published submissions
  def validate_awarded_attributes
    return if awarded_at && awarder
    errors.add(:experience_points_record, :absent_award_attributes)
  end

  def send_attempt_notification
    return unless course_user.real_student?

    Course::AssessmentNotifier.assessment_attempted(creator, assessment)
  end

  def send_submit_notification
    return unless workflow_state_was == 'attempting'
    return if assessment.autograded?
    return if !course_user.real_student? && !phantom_submission_email_enabled?

    Course::AssessmentNotifier.assessment_submitted(creator, course_user, self)
  end

  def phantom_submission_email_enabled?
    Course::Settings::AssessmentsComponent.
      email_enabled?(assessment.tab.category, :new_phantom_submission)
  end
end
