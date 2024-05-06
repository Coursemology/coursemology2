# frozen_string_literal: true

class Authentication::KeycloakVerificationService < Authentication::VerificationService
  KEYCLOAK_INSTROPECTION_URL = ENV['KEYCLOAK_AUTH_INSTROPECTION_URL'].freeze
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

  def introspect_token(access_token)
    instropection_response = \
      Keycloak::Client.get_token_introspection(access_token,
                                               ENV['KEYCLOAK_BE_CLIENT_ID'],
                                               ENV['KEYCLOAK_BE_CLIENT_SECRET'],
                                               KEYCLOAK_INSTROPECTION_URL)

    JSON.parse(instropection_response.to_s)
  end
end
