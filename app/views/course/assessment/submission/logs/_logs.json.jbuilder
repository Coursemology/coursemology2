# frozen_string_literal: true
json.logs submission.logs.ordered_by_date do |log|
  json.isValidAttempt log.valid_attempt?
  json.timestamp log.created_at
  json.ipAddress log.ip_address
  json.userAgent log.user_agent
  json.userSessionId log.user_session_id
  json.submissionSessionId log.submission_session_id
end
