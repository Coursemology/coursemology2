# frozen_string_literal: true
# TODO: Refactor to Course::Assessment::Answer, and refactor Answer to Attempt
class Course::Assessment::SubmissionQuestion < ApplicationRecord
  acts_as_discussion_topic display_globally: true

  validates :submission, presence: true
  validates :question, presence: true
  validates :submission_id, uniqueness: { scope: [:question_id], if: -> { question_id? && submission_id_changed? } }
  validates :question_id, uniqueness: { scope: [:submission_id], if: -> { submission_id? && question_id_changed? } }

  # The underlying column is `submission_id` (renamed from `submission_id`); foreign_key kept explicit
  # since the association name stays `submission`.
  belongs_to :submission, class_name: 'Course::Assessment::Attempt', foreign_key: 'submission_id',
                          inverse_of: :submission_questions
  belongs_to :question, class_name: 'Course::Assessment::Question',
                        inverse_of: :submission_questions

  # Coerce a `Course::Assessment::Submission` passed here into its `Attempt` (the association's
  # real target post-repoint) — mirrors the same coercion on `Course::Assessment::Answer` (see its
  # comment for the full rationale). Both `spec/factories/course_assessment_submission_questions.rb`'s
  # own default `submission { create(:submission, ...) }` and
  # `spec/models/course/assessment/submission_spec.rb`'s own `create(:course_assessment_submission_question,
  # submission: submission, ...)` pass the `Submission` half, which otherwise raises
  # `ActiveRecord::AssociationTypeMismatch`.
  def submission=(value)
    value = value.attempt if value.is_a?(Course::Assessment::Submission)
    super
  end

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
      joins(:submission).
      # `creator_id` lives on Course::Assessment::Attempt post-repoint — `:submission` now joins
      # course_assessment_submissions, so the arel_table reference must match.
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
