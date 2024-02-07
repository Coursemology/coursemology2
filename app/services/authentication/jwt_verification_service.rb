# frozen_string_literal: true

class Authentication::JwtVerificationService
  JWKS_CACHE_KEY = 'auth/jwks'
  JWKS_URL = ENV['KEYCLOAK_AUTH_JWKS_URL'].freeze
  Error = Struct.new(:message, :status)
  Response = Struct.new(:decoded_token, :error)

  def self.validate_token(access_token)
    decoded_token = decode_token(access_token)
    Response.new(decoded_token, nil)
  rescue JWT::VerificationError, JWT::DecodeError => e
    error = Error.new(e.message, :unauthorized)
    Response.new(nil, error)
  end

  def self.jwk_loader
    lambda do |options|
      jwks(force: options[:invalidate]) || {}
    end
  end

  def self.jwks(force: false)
    Rails.cache.fetch(JWKS_CACHE_KEY, force: force, skip_nil: true) do
      fetch_jwks
    end&.deep_symbolize_keys
  end

  def self.fetch_jwks
    jwks_uri = URI(JWKS_URL)
    jwks_response = Net::HTTP.get_response jwks_uri

    JSON.parse(jwks_response.body.to_s) if jwks_response.is_a? Net::HTTPSuccess
  end

  def self.decode_token(access_token)
    JWT.decode(access_token, nil, true, {
      algorithms: 'RS256',
      iss: ENV['KEYCLOAK_ISS'],
      verify_iss: true,
      aud: ENV['KEYCLOAK_AUD'],
      verify_aud: true,
      jwks: jwk_loader
    })
  end
end
