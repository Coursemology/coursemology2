# frozen_string_literal: true

class Authentication::KeycloakVerificationService < Authentication::VerificationService
  class << self
    delegate :validate_token, to: :new
  end

  def validate_token(access_token)
    decoded_token = introspect_token(access_token)&.deep_symbolize_keys

    if decoded_token[:active] == false
      error = Error.new('Verification failed')
      Response.new(nil, error)
    else
      Response.new(decoded_token, nil)
    end
  rescue StandardError => e
    Response.new(nil, e)
  end

  private

  def client_id
    Rails.application.credentials.dig(:keycloak, :backend, :client_id)
  end

  def client_secret
    Rails.application.credentials.dig(:keycloak, :backend, :client_secret)
  end

  def introspection_url
    Rails.application.credentials.dig(:keycloak, :introspection_url)
  end

  def introspect_token(access_token)
    instropection_response = \
      Keycloak::Client.get_token_introspection(access_token,
                                               client_id,
                                               client_secret,
                                               introspection_url)

    JSON.parse(instropection_response.to_s)
  end
end
