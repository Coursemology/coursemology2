# frozen_string_literal: true

# Authenticate the assessment and stores the authentication token in the given session.
# Token generation is based on the assessment password, so that if the password changes,
#   the token automatically becomes invalid.
class Course::Assessment::AuthenticationService
  # @param [Course::Assessment] assessment The password protected assessment.
  # @param [string] session_id The current session ID.
  def initialize(assessment, session_id)
    @assessment = assessment
    @session_id = session_id
  end

  # Check if the password from user input matches the assessment password.
  #
  # @param [String] password_input
  # @return [Boolean] true if matches
  def authenticate(password_input)
    return true unless @assessment.view_password_protected?

    if password_input == @assessment.view_password
      set_session_token!
      true
    else
      @assessment.errors.add(:password, I18n.t('helpers.password.wrong_password'))
      false
    end
  end

  # Generates a new authentication token and stores it in current session.
  def set_session_token!
    token_expiry_seconds = 86_400
    REDIS.set(session_key, password_token, ex: token_expiry_seconds)
  end

  # Check whether current session is the same session that created the submission or not.
  #
  # @return [Boolean]
  def authenticated?
    return true unless @session_id

    REDIS.get(session_key) == password_token
  end

  private

  def password_token
    Digest::SHA1.hexdigest(@assessment.view_password)
  end

  def session_key
    "session_#{@session_id}_assessment_#{@assessment.id}_access_token"
  end
end
