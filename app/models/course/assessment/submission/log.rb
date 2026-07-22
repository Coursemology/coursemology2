# frozen_string_literal: true
class Course::Assessment::Submission::Log < ApplicationRecord
  # Rails derives a nested model's table name from its parent's `table_name`
  # (`Submission.table_name.singularize + "_logs"`). Since Submission now maps to
  # `course_assessment_attempts`, that derivation yields the nonexistent
  # `course_assessment_attempt_logs`. Pin the real table name explicitly. (Phase 1a workaround;
  # revisit in 1b when Submission stops owning the attempts table.)
  self.table_name = 'course_assessment_submission_logs'

  validates :submission, presence: true

  belongs_to :submission, class_name: 'Course::Assessment::Submission',
                          inverse_of: :logs

  scope :ordered_by_date, ->(direction = :desc) { order(created_at: direction) }

  def ip_address
    request['HTTP_X_FORWARDED_FOR']
  end

  def user_agent
    request['HTTP_USER_AGENT']
  end

  def user_session_id
    request['USER_SESSION_ID']
  end

  def submission_session_id
    request['SUBMISSION_SESSION_ID']
  end

  def valid_attempt?
    user_session_id == submission_session_id
  end
end
