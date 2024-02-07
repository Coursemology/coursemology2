# frozen_string_literal: true

class Authentication::KeycloakVerificationService < Authentication::VerificationService
  KEYCLOAK_INSTROPECTION_URL = ENV['KEYCLOAK_AUTH_INSTROPECTION_URL'].freeze
  class << self
    delegate :validate_token, to: :new
  end

  def validate_token(access_token)
    decoded_token = introspect_token(access_token)
  end

  private

  def introspect_token(access_token)
    keycloak_instropection_uri = URI(KEYCLOAK_INSTROPECTION_URL)
    payload = { clientId: ENV['KEYCLOAK_CLIENT_ID'],
                client_secret: ENV['KEYCLOAK_CLIENT_SECRET'],
                token: access_token }

    # Seems like payload is not included
    instropection_response = Net::HTTP.post(keycloak_instropection_uri, payload.to_json,
                                            'Content-Type' => 'application/x-www-form-urlencoded')

    JSON.parse(instropection_response.body.to_s) if instropection_response.is_a? Net::HTTPSuccess
  end
end
