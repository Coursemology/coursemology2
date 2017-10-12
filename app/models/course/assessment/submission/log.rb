# frozen_string_literal: true
class Course::Assessment::Submission::Log < ApplicationRecord
  belongs_to :submission, class_name: Course::Assessment::Submission.name,
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
