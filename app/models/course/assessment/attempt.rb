# frozen_string_literal: true
class Course::Assessment::Attempt < ApplicationRecord
  # The `course_assessment_submissions` table IS the attempt base record: it was kept under its
  # historical name (rather than renamed to `course_assessment_attempts`) so the change is purely
  # additive and safe under rolling deploys. `Attempt`'s Rails-default table name
  # (`course_assessment_attempts`) does not exist; point it at the real base table.
  self.table_name = 'course_assessment_submissions'
  # ApplicationUserstampConcern's `inherited` hook ran `add_userstamp_associations({})` against
  # `course_assessment_attempts` (the nonexistent default) before the line above took effect, so it
  # added no creator/updater associations → creator_id/updater_id NOT NULL violation on insert.
  # Re-run now that table_name is correct — the base has both columns, so this ADDS them back.
  add_userstamp_associations({})
  include Workflow
  include Course::Assessment::Submission::WorkflowEventConcern
  include Course::Assessment::Submission::AnswersConcern

  attr_accessor :has_unsubmitted_or_draft_answer

  FORCE_SUBMIT_DELAY = 5.minutes

  after_save :auto_grade_submission, if: :submitted?
  after_save :retrieve_codaveri_feedback, if: :submitted?
  after_create :create_force_submission_job, if: :attempting?

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

  validate :validate_unique_submission, on: :create
  validate :validate_autograded_no_partial_answer, if: :submitted?
  validates :submitted_at, presence: true, unless: :attempting?
  validates :workflow_state, length: { maximum: 255 }, presence: true
  validates :creator, presence: true
  validates :updater, presence: true
  validates :assessment, presence: true

  belongs_to :assessment, inverse_of: :attempts

  has_one :submission, class_name: 'Course::Assessment::Submission', inverse_of: :attempt,
                       dependent: :destroy

  # Course-coupled / EXP slice of the submission interface, owned by the extension. Delegating here lets
  # an Attempt stand in as `@submission` for a marketplace preview: the shared submission
  # jbuilders call these on the served object, and for a preview (no extension) they must be nil. For a
  # real submission the serving path uses the extension directly, so these are exercised only by previews.
  delegate :course_user, :current_points_awarded, :experience_points_record, :publisher,
           to: :submission, allow_nil: true

  has_many :submission_questions, class_name: 'Course::Assessment::SubmissionQuestion',
                                  foreign_key: 'submission_id', dependent: :destroy, inverse_of: :submission

  # @!attribute [r] answers
  #   The answers associated with this attempt. There can be more than one answer per question,
  #   this is because every answer is saved over time. Use the {.latest} scope of the answers if
  #   only the latest answer for each question is desired.
  has_many :answers, class_name: 'Course::Assessment::Answer', dependent: :destroy,
                     foreign_key: 'submission_id', inverse_of: :submission do
    include Course::Assessment::Submission::AnswersConcern
  end
  has_many :multiple_response_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: 'Course::Assessment::Answer::MultipleResponse'
  has_many :text_response_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: 'Course::Assessment::Answer::TextResponse'
  has_many :programming_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: 'Course::Assessment::Answer::Programming'
  has_many :scribing_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: 'Course::Assessment::Answer::Scribing'
  has_many :forum_post_response_answers,
           through: :answers, inverse_through: :answer, source: :actable,
           source_type: 'Course::Assessment::Answer::ForumPostResponse'
  has_many :question_bundle_assignments, class_name: 'Course::Assessment::QuestionBundleAssignment',
                                         inverse_of: :submission, dependent: :destroy

  has_many :logs, class_name: 'Course::Assessment::Submission::Log',
                  inverse_of: :submission, dependent: :destroy

  accepts_nested_attributes_for :answers

  # @!attribute [r] graded_at
  #   Returns the time the submission was graded.
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

  # @!attribute [r] grade
  #   Returns the total grade of the submissions.
  calculated :grade, (lambda do
    Course::Assessment::Answer.unscope(:order).
      where('course_assessment_answers.submission_id = course_assessment_submissions.id
             AND course_assessment_answers.current_answer = true').
      select('sum(course_assessment_answers.grade)')
  end)

  # @!attribute [r] grader_ids
  #   Returns the grader_ids of a submission
  calculated :grader_ids, (lambda do
    Course::Assessment::Answer.unscope(:order).
      where('course_assessment_answers.submission_id = course_assessment_submissions.id
             AND course_assessment_answers.current_answer = true').
      select('ARRAY_REMOVE(ARRAY_AGG(DISTINCT(course_assessment_answers.grader_id)), NULL)')
  end)

  # @!method self.by_user(user)
  #   Finds all the attempts by the given user.
  #   @param [User] user The user to filter attempts by
  scope :by_user, ->(user) { where(creator: user) }

  # @!method self.by_users(user)
  #   @param [Integer|Array<Integer>] user_ids The user ids to filter attempts by
  scope :by_users, ->(user_ids) { where(creator_id: user_ids) }

  # @!method self.from_category(category)
  #   Finds all the attempts in the given category.
  #   @param [Course::Assessment::Category] category The category to filter attempts by
  scope :from_category, (lambda do |category|
    where(assessment_id: category.assessments.select(:id))
  end)

  # @!method self.ordered_by_date
  #   Orders the attempts by date of creation. This defaults to reverse chronological order
  #   (newest attempt first).
  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  # @!method self.ordered_by_submitted_date
  #   Orders the attempts by date of submission (newest submission first).
  scope :ordered_by_submitted_date, -> { order(submitted_at: :desc) }

  # @!method self.confirmed
  #   Returns attempts which have been submitted (which may or may not be graded).
  scope :confirmed, -> { where(workflow_state: [:submitted, :graded, :published]) }

  scope :pending_for_grading, (lambda do
    where(workflow_state: [:submitted, :graded]).
      joins(:assessment).
      where('course_assessments.autograded = ?', false)
  end)

  # Names the two populations so that picking one is a deliberate act (design spec §3.4). Any
  # staff-facing count/list/export must go through `assessment.submissions`, never `.attempts` —
  # `.attempts` includes preview attempts, `.submissions` never does.
  scope :course_submissions, -> { joins(:submission) }
  scope :previews, -> { where.missing(:submission) }

  alias_method :finalise=, :finalise!
  alias_method :mark=, :mark!
  alias_method :unmark=, :unmark!
  alias_method :publish=, :publish!
  alias_method :unsubmit=, :unsubmit!

  # Creates an Auto Grading job for this attempt. This saves the attempt if there are pending
  # changes.
  #
  # @param [Boolean] only_ungraded Whether grading should be done ONLY for
  #   ungraded_answers, or for all answers regardless of workflow state
  #
  # @return [Course::Assessment::Submission::AutoGradingJob] The job instance.
  def auto_grade!(only_ungraded: false)
    # Fully qualified: bare `AutoGradingJob` relied on this method being lexically nested inside
    # `Course::Assessment::Submission` on the pre-split model — that lookup breaks once the method
    # lives on `Attempt` instead.
    Course::Assessment::Submission::AutoGradingJob.perform_later(self, only_ungraded)
  end

  # Creates an Auto Feedback job for this attempt.
  #
  # @return [Course::Assessment::Submission::AutoFeedbackJob] The job instance.
  def auto_feedback!
    if assessment.course.component_enabled?(Course::CodaveriComponent) &
       (assessment.course.codaveri_feedback_workflow != 'none')
      Course::Assessment::Submission::AutoFeedbackJob.perform_later(self)
    end
  end

  def unsubmitting?
    !!@unsubmitting
  end

  def submission_view_blocked?(course_user)
    !attempting? && !published? && assessment.block_student_viewing_after_submitted? && course_user&.student?
  end

  # A preview is a throwaway attempt with no Submission extension row (marketplace "try it out"). Real
  # attempts always have exactly one. This is the single source of truth for preview-only branching.
  def preview?
    submission.nil?
  end

  # Throws away all work on this attempt and starts it over: destroys every answer, returns the attempt to
  # the `attempting` state, and rebuilds fresh answers. Backs the marketplace preview "Reset attempt" action.
  def reset_attempt!
    transaction do
      answers.destroy_all
      self.submitted_at = nil
      self.published_at = nil
      self.workflow_state = 'attempting'
      save!
      answers.reload
      create_new_answers
    end
  end

  def questions
    assessment.randomization.nil? ? assessment.questions : assigned_questions
  end

  # The assigned questions for this attempt, ordered by question_group and question_bundle_question
  def assigned_questions
    Course::Assessment::Question.
      joins(question_bundles: [:question_group, question_bundle_assignments: :submission]).
      merge(Course::Assessment::Attempt.where(id: self)).
      merge(Course::Assessment::QuestionGroup.order(:weight)).
      merge(Course::Assessment::QuestionBundleQuestion.order(:weight)).
      extending(Course::Assessment::QuestionsConcern)
  end

  def create_force_submission_job
    return unless assessment.time_limit

    Course::Assessment::Submission::ForceSubmitTimedSubmissionJob.
      set(wait_until: created_at + assessment.time_limit.minutes + FORCE_SUBMIT_DELAY).
      perform_later(assessment, id, creator)
  end

  # The answers with current_answer flag set to true, filtering out orphaned answers to questions
  # which are no longer assigned to the attempt for randomized assessment.
  #
  # If there are multiple current_answers for a particular question, return the first one.
  # This guards against a race condition creating multiple current_answers for a given
  # question in load_or_create_answers.
  def current_answers
    if assessment.randomization.nil?
      # Filtering by question ids is not needed for non-randomized assessment as it adds more query time.
      filtered_answers = answers
    else
      # Can't do filtering in AR because `answer` may not be persisted, and AR is dumb.
      question_ids = questions.pluck(:id)
      filtered_answers = answers.select { |answer| answer.question_id.in? question_ids }
    end
    filtered_answers.select(&:current_answer?).group_by(&:question_id).map { |pair| pair[1].first }
  end

  # @return [Array<Course::Assessment::Answer>] Current answers to programming questions
  def current_programming_answers
    current_answers.select { |ans| ans.actable_type == Course::Assessment::Answer::Programming.name }
  end

  # Loads basic information about the past answers of each question
  def answer_history
    answers.
      without_attempting_state.
      group_by(&:question_id).
      map do |pair|
        {
          question_id: pair[0],
          answers: pair[1].map do |answer|
            {
              id: answer.id,
              createdAt: answer.created_at&.iso8601,
              currentAnswer: answer.current_answer,
              workflowState: answer.workflow_state
            }
          end
        }
      end
  end

  # Returns the count of user messages for each question in the attempt.
  def user_get_help_message_counts
    Course::Assessment::SubmissionQuestion.find_by_sql(<<-SQL)
      SELECT
        q.id AS question_id,
        COUNT(m.id) AS message_count
      FROM course_assessment_submission_questions sq
      INNER JOIN course_assessment_questions q ON sq.question_id = q.id
      INNER JOIN course_assessment_question_programming pq
        ON q.actable_id = pq.id AND q.actable_type = 'Course::Assessment::Question::Programming'
      INNER JOIN course_assessment_submissions s ON sq.submission_id = s.id
      LEFT JOIN live_feedback_threads t ON t.submission_question_id = sq.id
      LEFT JOIN live_feedback_messages m ON m.thread_id = t.id AND m.creator_id != #{User::SYSTEM_USER_ID}
      WHERE
        s.id = #{id}
        AND pq.live_feedback_enabled = TRUE
      GROUP BY q.id;
    SQL
  end

  # Returns all graded answers of the question in current attempt.
  def evaluated_or_graded_answers(question)
    answers.select { |a| a.question_id == question.id && (a.evaluated? || a.graded?) }
  end

  private

  # Validate that the attempt creator does not have an existing attempt for this assessment.
  #
  # (Reclassified from Submission per the design spike §3.1: it enforces the DB's
  # `unique_assessment_id_and_creator_id` index, which lives on `course_assessment_submissions` — a
  # "one attempt per creator per assessment" rule, not a submission-specific one. The i18n key is a
  # wire/UX string and is deliberately NOT renamed even though the validation now lives here.)
  def validate_unique_submission
    existing = Course::Assessment::Attempt.find_by(assessment_id: assessment.id, creator_id: creator.id)
    return unless existing

    errors.clear
    errors.add(:base, I18n.t('activerecord.errors.models.course/assessment/' \
                             'submission.submission_already_exists'))
  end

  # Validate that there is no unsubmitted updated answer for autograded assessment that
  # does not allow partial submission
  def validate_autograded_no_partial_answer
    return unless assessment.autograded && !assessment.allow_partial_submission

    errors.add(:base, :autograded_no_partial_answer) if has_unsubmitted_or_draft_answer
  end

  # Queues the attempt for auto grading, after the attempt has changed to the submitted state.
  def auto_grade_submission
    return unless saved_change_to_workflow_state?

    execute_after_commit do
      auto_grade!(only_ungraded: true)
    end
  end

  # Retrieve codaveri feedback only for current answers of codaveri programming question type
  # for finalised attempts.
  def retrieve_codaveri_feedback
    return unless saved_change_to_workflow_state?

    execute_after_commit do
      auto_feedback!
    end
  end
end
