# frozen_string_literal: true
# Authenticate the assessment and update the session_id in submission.
class Course::Assessment::SessionLogService
  # @param [Course::Assessment] assessment The password protected assessment.
  # @param [ActionDispatch::Request::Session] session The current session.
  # @param [Course::Assessment::Submission] submission The current submission.
  def initialize(assessment, session, submission)
    @assessment = assessment
    @session = session
    @submission = submission
  end

  # Log submission access attempts for password-protected assessments.
  def log_submission_access(request)
    request_headers = request.headers.env.select do |k, _|
      k.in?(ActionDispatch::Http::Headers::CGI_VARIABLES) || k =~ /^HTTP_/
    end

    request_headers['USER_SESSION_ID'] = current_authentication_token
    request_headers['SUBMISSION_SESSION_ID'] = @submission.session_id

    @submission.logs.create(request: request_headers)
  end

  private

  def current_authentication_token
    @session[session_key]
  end

  def session_key
    "assessment_#{@assessment.id}_authentication_token"
  end
end
