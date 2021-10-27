# frozen_string_literal: true
class Course::Assessment::Submission < ApplicationRecord
  include Workflow
  include Course::Assessment::Submission::WorkflowEventConcern
  include Course::Assessment::Submission::TodoConcern
  include Course::Assessment::Submission::NotificationConcern

  acts_as_experience_points_record

  after_save :auto_grade_submission, if: :submitted?

  workflow do
    state :attempting do
      # TODO: Change the if condition to use a symbol when the Workflow gem is upgraded to 1.3.0.
      event :finalise, transitions_to: :published,
                       if: proc { |submission| submission.assessment.questions.empty? }
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
      # Resubmit programming questions for grading, used to regrade autograded
      # submissions when assessment booleans are modified
      event :resubmit_programming, transitions_to: :submitted
    end
  end

  validate :validate_consistent_user, :validate_unique_submission, on: :create
  validate :validate_awarded_attributes, if: :published?
  validates :submitted_at, presence: true, unless: :attempting?
  validates :workflow_state, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :assessment, presence: true

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
  has_many :forum_post_response_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: Course::Assessment::Answer::ForumPostResponse.name
  has_many :question_bundle_assignments, class_name: Course::Assessment::QuestionBundleAssignment.name,
                                         inverse_of: :submission, dependent: :destroy

  # @!attribute [r] graders
  #   The graders associated with this submission.
  has_many :graders, through: :answers, class_name: User.name

  belongs_to :publisher, class_name: User.name, inverse_of: nil, optional: true

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
    result = result.where(assessment_id: filter_params[:assessment_id]) if filter_params[:assessment_id].present?
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
  # @param [Boolean] only_ungraded Whether grading should be done ONLY for
  #   ungraded_answers, or for all answers regardless of workflow state
  #
  # @return [Course::Assessment::Submission::AutoGradingJob] The job instance.
  def auto_grade!(only_ungraded: false)
    AutoGradingJob.perform_later(self, only_ungraded: only_ungraded)
  end

  def unsubmitting?
    !!@unsubmitting
  end

  # The total grade of the submission
  def grade
    current_answers.map { |a| a.grade || 0 }.sum
  end

  def questions
    assessment.randomization.nil? ? assessment.questions : assigned_questions
  end

  # The assigned questions for this submission, ordered by question_group and question_bundle_question
  def assigned_questions
    Course::Assessment::Question.
      joins(question_bundles: [:question_group, question_bundle_assignments: :submission]).
      merge(Course::Assessment::Submission.where(id: self)).
      merge(Course::Assessment::QuestionGroup.order(:weight)).
      merge(Course::Assessment::QuestionBundleQuestion.order(:weight)).
      extending(Course::Assessment::QuestionsConcern)
  end

  # The answers with current_answer flag set to true, filtering out orphaned answers to questions which are no longer
  # assigned to the submission.
  #
  # If there are multiple current_answers for a particular question, return the first one.
  # This guards against a race condition creating multiple current_answers for a given
  # question in load_or_create_answers.
  def current_answers
    # Can't do filtering in AR because `answer` may not be persisted, and AR is dumb.
    question_ids = questions.pluck(:id)
    answers.select { |answer| answer.question_id.in? question_ids }.
      select(&:current_answer?).group_by(&:question_id).map { |pair| pair[1].first }
  end

  # @return [Array<Course::Assessment::Answer>] Current answers to programming questions
  def current_programming_answers
    current_answers.select { |ans| ans.actable_type == Course::Assessment::Answer::Programming.name }
  end

  # Loads the answer ids of the past answers of each question
  def answer_history
    answers.unscope(:order).
      order(created_at: :desc).
      pluck(:question_id, :id, :current_answer).
      group_by(&:first).
      map do |pair|
      {
        question_id: pair[0],
        answer_ids: pair[1].reject(&:last).map(&:second).first(10)
      }
    end
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
    return unless saved_change_to_workflow_state?

    execute_after_commit do
      # Grade only ungraded answers when submission state changes from published to submitted.
      # Otherwise, grade all answers regardless of workflow state.
      # only_ungraded is true when resubmit_programming event is called.
      auto_grade!(only_ungraded: changes['workflow_state'] == ['published', 'submitted'])
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
end
