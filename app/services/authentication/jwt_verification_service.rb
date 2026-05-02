# frozen_string_literal: true

class Authentication::JwtVerificationService < Authentication::VerificationService
  JWKS_CACHE_KEY = 'auth/jwks'

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

  def jwks_url
    Rails.application.credentials.dig(:keycloak, :jwks_url)
  end

  def iss
    Rails.application.credentials.dig(:keycloak, :iss)
  end

  def aud
    Rails.application.credentials.dig(:keycloak, :aud)
  end

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
    jwks_uri = URI(jwks_url)
    jwks_response = Net::HTTP.get_response(jwks_uri)

    JSON.parse(jwks_response.body.to_s) if jwks_response.is_a? Net::HTTPSuccess
  end

  def decode_token(access_token)
    JWT.decode(access_token, nil, true, {
      algorithms: 'RS256',
      iss: iss,
      verify_iss: true,
      aud: aud,
      verify_aud: true,
      jwks: jwk_loader
    })
  end
end
