# frozen_string_literal: true
# Authenticate the assessment and store the result in the session.
class Course::Assessment::SessionAuthenticationService
  # @param [Course::Assessment] assessment The password protected assessment.
  # @param [ActionDispatch::Request::Session] session The current session.
  def initialize(assessment, session)
    @assessment = assessment
    @session = session
  end

  # Check if the password from user input matches the assessment password.
  # Further stores the password in session so that user do not need to input again.
  #
  # @param [String] password
  # @return [Boolean] true if matches
  def authenticate(password)
    return true unless @assessment.password_protected?

    if password == @assessment.password
      store_password(password)
      true
    else
      false
    end
  end

  # Check if user has inputted the correct passowrd before
  #
  # @return [Boolean]
  def authenticated?
    session_password == @assessment.password
  end

  private

  def store_password(password)
    @session[session_key] = password
  end

  def session_password
    @session[session_key]
  end

  def session_key
    "assessment_#{@assessment.id}_password"
  end
end
