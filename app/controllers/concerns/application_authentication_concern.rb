# frozen_string_literal: true
module ApplicationAuthenticationConcern
  extend ActiveSupport::Concern

  REQUIRES_AUTHENTICATION = { message: 'Requires authentication' }.freeze
  BAD_CREDENTIALS = {
    message: 'Bad credentials'
  }.freeze
  MALFORMED_AUTHORIZATION_HEADER = {
    error: 'invalid_request',
    error_description: 'Authorization header value must follow this format: Bearer access-token',
    message: 'Bad credentials'
  }.freeze

  def current_user_from_token
    token = authenticate_token
    User.joins(:emails).where('user_emails.email = ?', token[:email]).first if token
  end

  def current_session_id
    @current_session_id ||= @decoded_token&.decoded_token&.[](:session_state)
  end

  private

  def authenticate_token
    access_token = token_from_request

    return if performed?

    @decoded_token ||= Authentication::AuthenticationService.validate_token(access_token, :local)

    if @decoded_token.error
      # render json: { message: @decoded_token.error.message }, status: @decoded_token.error.status and return
      return nil
    end

    @decoded_token.decoded_token
  end

  def token_from_request
    authorization_header_elements = request.headers['Authorization']&.split

    # render json: REQUIRES_AUTHENTICATION, status: :unauthorized and return unless authorization_header_elements
    return nil unless authorization_header_elements

    unless authorization_header_elements.length == 2
      # render json: MALFORMED_AUTHORIZATION_HEADER, status: :unauthorized and return
      return nil
    end

    scheme, token = authorization_header_elements

    # render json: BAD_CREDENTIALS, status: :unauthorized and return unless scheme.downcase == 'bearer'
    return nil unless scheme.downcase == 'bearer'

    token
  end
end
