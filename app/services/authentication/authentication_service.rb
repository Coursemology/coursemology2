# frozen_string_literal: true

class Authentication::AuthenticationService
  def self.validate_token(access_token, validation_method)
    validation_map[validation_method].call(access_token)
  end

  def self.validation_map
    {
      auth_server: ->(access_token) { external_validation(access_token) },
      local: ->(access_token) { local_validation(access_token) }
    }
  end

  def self.external_validation(access_token)
    Authentication::KeycloakVerificationService.validate_token(access_token)
  end

  def self.local_validation(access_token)
    Authentication::JwtVerificationService.validate_token(access_token)
  end
end
