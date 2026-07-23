# frozen_string_literal: true
# TODO: Refactor to Course::Assessment::Answer, and refactor Answer to Attempt
class Course::Assessment::SubmissionQuestion < ApplicationRecord
  acts_as_discussion_topic display_globally: true

  validates :submission, presence: true
  validates :question, presence: true
  validates :submission_id, uniqueness: { scope: [:question_id], if: -> { question_id? && submission_id_changed? } }
  validates :question_id, uniqueness: { scope: [:submission_id], if: -> { submission_id? && question_id_changed? } }

  # Association is `:submission` but its target is the `Attempt` base; the FK column stays
  # `submission_id` (the base table/columns were not renamed — additive split). `foreign_key` is
  # stated explicitly to document that the column is `submission_id`, not `attempt_id`.
  belongs_to :submission, class_name: 'Course::Assessment::Attempt', foreign_key: 'submission_id',
                          inverse_of: :submission_questions
  include Course::Assessment::CoercesSubmissionToAttempt

  belongs_to :question, class_name: 'Course::Assessment::Question',
                        inverse_of: :submission_questions

  # `attempt` is the accurate name for what `:submission` returns — the Attempt base record. Prefer it in
  # new code (e.g. `@submission_question.attempt.submission`); the association stays `:submission` for
  # existing call sites. Reader-only alias.
  alias_method :attempt, :submission

  has_many :threads, class_name: 'Course::Assessment::LiveFeedback::Thread',
                     inverse_of: :submission_question, dependent: :destroy
  after_initialize :set_course, if: :new_record?
  before_validation :set_course, if: :new_record?

  # Specific implementation of Course::Discussion::Topic#from_user, this is not supposed to be
  # called directly.
  scope :from_user, (lambda do |user_id|
    # joining { submission }.
    #   where.has { submission.creator_id.in(user_id) }.
    #   joining { discussion_topic }.selecting { discussion_topic.id }
    unscoped.
      # SubmissionQuestion `:submission` joins the Attempt base (which includes previews); the nested
      # `:submission` (Attempt's `has_one :submission`) inner-joins the extension table, restricting
      # to real submissions so a preview's submission_questions never leak here. `creator_id` lives on
      # Course::Assessment::Attempt post-repoint, so the arel_table reference must match.
      joins(submission: :submission).
      where(Course::Assessment::Attempt.arel_table[:creator_id].in(user_id)).
      joins(:discussion_topic).
      select(Course::Discussion::Topic.arel_table[:id])
  end)

  # Gets the SubmissionQuestion of a specific submission
  scope :from_submission, (lambda do |submission_id|
    find_by(submission_id: submission_id)
  end)

  def notify(post)
    Course::Assessment::SubmissionQuestion::CommentNotifier.post_replied(post)
  end

  private

  # Set the course as the same course of the assessment.
  # This is needed because it acts as a discussion topic.
  def set_course
    self.course ||= submission.assessment.course if submission&.assessment
  end
end
