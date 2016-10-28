# frozen_string_literal: true
# Authenticate the assessment and update the session_id in submission.
class Course::Assessment::SessionAuthenticationService
  # @param [Course::Assessment] assessment The password protected assessment.
  # @param [ActionDispatch::Request::Session] session The current session.
  # @param [Course::Assessment::Submission|nil] submission The session id will be stored if the
  #   submission is given.
  def initialize(assessment, session, submission = nil)
    @assessment = assessment
    @session = session
    @submission = submission
  end

  # Check if the password from user input matches the assessment password.
  # Further stores the session_id in submission, this ensures that current_user is the only one that
  #   can access the submission.
  #
  # @param [String] password
  # @return [Boolean] true if matches
  def authenticate(password)
    return true unless @assessment.password_protected?

    if password == @assessment.password
      update_session_id if @submission
      true
    else
      false
    end
  end

  # Check whether current session is the same session that created the submission or not.
  #
  # @return [Boolean]
  def authenticated?
    current_session_id == @submission.session_id
  end

  private

  def update_session_id
    @submission.update_column(:session_id, current_session_id)
  end

  def current_session_id
    @session[:session_id]
  end
end
