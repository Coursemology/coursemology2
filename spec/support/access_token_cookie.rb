# frozen_string_literal: true
# Builds the access_token cookie that ApplicationUserConcern#add_token_to_cookie writes, for specs
# that need a request to arrive carrying one.
#
# It cannot be seeded through an integration session's own jar: that is a Rack::Test::CookieJar,
# which has no #encrypted. So the ciphertext is produced from a real CookieJar and handed over as a
# raw request header.
module AccessTokenCookieHelpers
  # @param [String] token The access token to encrypt into the cookie.
  # @return [Hash] Headers to merge into a request, carrying the cookie as the browser would.
  def access_token_cookie(token)
    env = Rack::MockRequest.env_for('/', 'HTTP_HOST' => 'test.host').merge(Rails.application.env_config)
    jar = ActionDispatch::Cookies::CookieJar.build(ActionDispatch::Request.new(env), {})
    jar.encrypted[:access_token] = token

    # The ciphertext has to be escaped the way Rails escapes it on the way out, otherwise any '+' it
    # happens to contain is read back as a space and decryption fails for roughly half of all
    # generated tokens.
    { 'HTTP_COOKIE' => "access_token=#{Rack::Utils.escape(jar[:access_token])}" }
  end
end

RSpec.configure do |config|
  config.include AccessTokenCookieHelpers, type: :request
end
