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
    return true unless @assessment.session_password_protected?

    if password == @assessment.session_password
      create_new_token if @submission
      true
    else
      false
    end
  end

  # Generates an authentication token, this token is supposed to be saved in both user session and submission.
  # User can only access the submission if session token matches the one in submission or a password is provided.
  #
  # @return [String] the new authentication token.
  def generate_authentication_token
    SecureRandom.hex(8)
  end

  # Saves the token to session
  def save_token_to_session(token)
    @session[session_key] = token
  end

  # Check whether current session is the same session that created the submission or not.
  #
  # @return [Boolean]
  def authenticated?
    current_authentication_token && current_authentication_token == @submission.session_id
  end

  private

  def create_new_token
    token = generate_authentication_token

    @submission.update_column(:session_id, token)
    save_token_to_session(token)
  end

  def current_authentication_token
    @session[session_key]
  end

  def session_key
    "assessment_#{@assessment.id}_authentication_token"
  end
end
