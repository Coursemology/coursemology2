# frozen_string_literal: true

class Authentication::JwtVerificationService < Authentication::VerificationService
  JWKS_CACHE_KEY = 'auth/jwks'
  JWKS_URL = ENV['KEYCLOAK_AUTH_JWKS_URL'].freeze

  class << self
    delegate :validate_token, to: :new
  end

  def validate_token(access_token)
    decoded_token = decode_token(access_token)[0]&.deep_symbolize_keys
    Response.new(decoded_token, nil)
  rescue JWT::VerificationError, JWT::DecodeError => e
    error = Error.new(e.message, :unauthorized)
    Response.new(nil, error)
  end

  private

  def jwk_loader
    lambda do |options|
      jwks(force: options[:invalidate]) || {}
    end
  end

  def jwks(force: false)
    Rails.cache.fetch(JWKS_CACHE_KEY, force: force, skip_nil: true) do
      fetch_jwks
    end&.deep_symbolize_keys
  end

  def fetch_jwks
    jwks_uri = URI(JWKS_URL)
    jwks_response = Net::HTTP.get_response(jwks_uri)

    JSON.parse(jwks_response.body.to_s) if jwks_response.is_a? Net::HTTPSuccess
  end

  def decode_token(access_token)
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
