# frozen_string_literal: true
module ApplicationCableAuthenticationConcern
  def current_user_from_token
    token = authenticate_token
    User.with_email_addresses(token[:email]).first if token
  end

  private

  def authenticate_token
    access_token = token_from_request

    @decoded_token ||= Authentication::AuthenticationService.validate_token(access_token, :local)

    return nil if @decoded_token.error

    @decoded_token.decoded_token
  end

  def token_from_request
    request.params['token']
  end
end
