# frozen_string_literal: true
require 'rails_helper'

# The cookie under test is httponly, so only a server response can expire it. That makes this a
# request spec: what matters is the Set-Cookie the browser actually receives.
RSpec.describe 'Access token cookie' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:administrator) { create(:administrator) }

    before { host! instance.host }

    # Mirrors the controller specs, which sidestep Keycloak the same way.
    before do
      allow(Authentication::AuthenticationService).to receive(:validate_token) do |access_token, _method|
        if access_token == 'a-valid-token'
          Authentication::VerificationService::Response.new(
            { email: administrator.email, session_state: 'a-session' }, nil
          )
        else
          error = Authentication::VerificationService::Error.new('Invalid token', :unauthorized)
          Authentication::VerificationService::Response.new(nil, error)
        end
      end
    end

    def deleted_in_response?
      # Rails expires a cookie by sending it back empty, so the header names it with a nil value.
      response.cookies.key?('access_token') && response.cookies['access_token'].nil?
    end

    it 'expires the cookie the request arrived with' do
      cookies['access_token'] = 'a-previously-issued-token'

      delete '/access_token'

      expect(response).to have_http_status(:no_content)
      expect(deleted_in_response?).to be(true)
    end

    # Signing out is exactly when the credential is most likely to be unusable already, so this
    # must not require one.
    it 'succeeds without any credential' do
      delete '/access_token'

      expect(response).to have_http_status(:no_content)
    end

    # ApplicationUserConcern#refresh_token_cookie mints the cookie on every publicly accessible
    # action, and this is one. Skipping it here keeps the endpoint incapable of issuing a
    # credential, so a bearer token cannot leave a freshly minted cookie behind.
    it 'does not mint a cookie when a bearer token is presented' do
      delete '/access_token', headers: { 'Authorization' => 'Bearer a-valid-token' }

      expect(response).to have_http_status(:no_content)
      expect(response.cookies['access_token']).to be_nil
    end
  end
end
