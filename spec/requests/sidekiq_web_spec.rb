# frozen_string_literal: true
require 'rails_helper'

# Sidekiq::Web is mounted in the router rather than reached through a controller, so its access
# control lives in SidekiqAdminConstraint and can only be exercised through a real request.
RSpec.describe 'Sidekiq Web dashboard' do
  let(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:administrator) { create(:administrator) }
    let(:normal_user) { create(:user) }

    let(:tokens) do
      {
        'admin-token' => administrator.email,
        'user-token' => normal_user.email
      }
    end

    # The dashboard itself is Sidekiq's, and rendering it wants a live Redis. What is under test is
    # who the router lets reach it, so stand in for the mounted app: being called at all is the
    # assertion, and a Redis hiccup can never look like an authorisation bug.
    before do
      allow(Sidekiq::Web).to receive(:call).and_return([200, { 'content-type' => 'text/plain' }, ['dashboard']])
    end

    # Access tokens are minted by Keycloak, so decoding is stubbed the way controller specs already
    # sidestep it. Everything else runs for real: header parsing, the encrypted cookie, the user
    # lookup by email, and the role check.
    before do
      allow(Authentication::AuthenticationService).to receive(:validate_token) do |access_token, _method|
        email = tokens[access_token]
        if email
          Authentication::VerificationService::Response.new({ email: email, session_state: 'a-session' }, nil)
        else
          error = Authentication::VerificationService::Error.new('Invalid token', :unauthorized)
          Authentication::VerificationService::Response.new(nil, error)
        end
      end
    end

    # The controller that runs the authorization code flow inherits ApplicationController, whose
    # multitenancy before_action rejects a host that is not a known instance.
    before { host! instance.host }

    # The authorization code flow reads these; the deployed values live in credentials.
    before do
      allow(Keycloak).to receive_messages(auth_server_url: 'http://keycloak.test', realm: 'coursemology')
      allow(Rails.application.credentials).to receive(:dig).and_call_original
      allow(Rails.application.credentials).to receive(:dig).
        with(:keycloak, :frontend, :client_id).and_return('frontend-client')
    end

    # The dashboard's retry, kill and delete buttons are POSTs, so every rule below has to hold for
    # more than GET.
    WRITE_METHODS = [:post, :put, :patch, :delete].freeze

    describe '/sidekiq' do
      context 'when the user is a system administrator' do
        it 'serves the dashboard to a bearer token' do
          get '/sidekiq', headers: bearer('admin-token')

          expect(response).to have_http_status(:ok)
          expect(Sidekiq::Web).to have_received(:call)
        end

        it 'serves the dashboard to the encrypted access token cookie' do
          get '/sidekiq', headers: access_token_cookie('admin-token')

          expect(response).to have_http_status(:ok)
          expect(Sidekiq::Web).to have_received(:call)
        end

        it 'serves nested dashboard paths' do
          get '/sidekiq/queues/default', headers: bearer('admin-token')

          expect(response).to have_http_status(:ok)
          expect(Sidekiq::Web).to have_received(:call)
        end

        WRITE_METHODS.each do |method|
          it "serves #{method.to_s.upcase} requests" do
            public_send(method, '/sidekiq/retries', headers: bearer('admin-token'))

            expect(response).to have_http_status(:ok)
            expect(Sidekiq::Web).to have_received(:call)
          end
        end
      end

      # A credential the app accepts, refused on the role: sending them round Keycloak would only
      # return them to the same answer, so this short-circuits without leaving the app.
      context 'when the user is signed in but not an administrator' do
        it 'does not route to the dashboard' do
          get '/sidekiq', headers: bearer('user-token')

          expect(response).to have_http_status(:not_found)
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        it 'does not route to nested dashboard paths' do
          get '/sidekiq/queues/default', headers: bearer('user-token')

          expect(response).to have_http_status(:not_found)
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        it 'does not route to the dashboard when authenticated by cookie' do
          get '/sidekiq', headers: access_token_cookie('user-token')

          expect(response).to have_http_status(:not_found)
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        WRITE_METHODS.each do |method|
          it "does not route #{method.to_s.upcase} requests to the dashboard" do
            public_send(method, '/sidekiq/retries', headers: bearer('user-token'))

            expect(response).to have_http_status(:not_found)
            expect(Sidekiq::Web).to_not have_received(:call)
          end
        end
      end

      # No usable credential, so there is someone to sign in: start the authorization code flow at
      # Keycloak rather than at the client app's sign in page, which cannot mint the cookie.
      context 'when the user is not signed in' do
        it 'starts the authorization code flow' do
          get '/sidekiq'

          expect(response).to have_http_status(:redirect)
          expect(redirect_query['client_id']).to eq(['frontend-client'])
          expect(redirect_query['redirect_uri']).to eq(["http://#{instance.host}/sidekiq"])
          expect(redirect_query['response_type']).to eq(['code'])
          expect(redirect_query['code_challenge_method']).to eq(['S256'])
          expect(redirect_query['code_challenge'].first).to be_present
          expect(redirect_query['state'].first).to be_present
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        it 'starts the flow for a token the auth server does not recognise' do
          get '/sidekiq', headers: bearer('forged-token')

          expect(response).to have_http_status(:redirect)
          expect(response.location).to start_with('http://keycloak.test/realms/coursemology')
        end

        # Only a browser navigation can go round Keycloak; a lapsed dashboard button press cannot.
        WRITE_METHODS.each do |method|
          it "does not route #{method.to_s.upcase} requests to the dashboard" do
            public_send(method, '/sidekiq/retries')

            expect(response).to have_http_status(:not_found)
            expect(Sidekiq::Web).to_not have_received(:call)
          end
        end

        # A cancelled login must not be answered by starting the flow again.
        it 'does not restart the flow when Keycloak hands back an error' do
          get '/sidekiq', params: { error: 'access_denied' }

          expect(response).to have_http_status(:not_found)
        end
      end

      # The half that a redirect to the client app's sign in page could never do: the callback lands
      # on Rails, so the access_token cookie can be written before the dashboard is served.
      context 'when Keycloak calls back with an authorization code' do
        # Runs the real first leg so that state and the PKCE verifier are the ones in the session.
        def start_flow
          get '/sidekiq'
          CGI.parse(URI.parse(response.location).query.to_s)['state'].first
        end

        def stub_exchange(token)
          exchanged = instance_double(Net::HTTPOK, body: { access_token: token }.to_json)
          allow(exchanged).to receive(:is_a?).with(Net::HTTPSuccess).and_return(true)
          allow(Net::HTTP).to receive(:post_form).and_return(exchanged)
        end

        it 'admits an administrator and leaves them a usable cookie' do
          state = start_flow
          stub_exchange('admin-token')

          get '/sidekiq', params: { code: 'an-authorization-code', state: state }

          expect(response).to redirect_to('/sidekiq')

          # The whole point: the next request now carries a credential the constraint accepts.
          get '/sidekiq'
          expect(response).to have_http_status(:ok)
          expect(Sidekiq::Web).to have_received(:call)
        end

        it 'sends the verifier and the registered redirect URI to the token endpoint' do
          state = start_flow
          stub_exchange('admin-token')

          get '/sidekiq', params: { code: 'an-authorization-code', state: state }

          expect(Net::HTTP).to have_received(:post_form).with(
            URI.parse('http://keycloak.test/realms/coursemology/protocol/openid-connect/token'),
            hash_including(grant_type: 'authorization_code',
                           code: 'an-authorization-code',
                           client_id: 'frontend-client',
                           redirect_uri: "http://#{instance.host}/sidekiq")
          )
        end

        it 'refuses a non-administrator who signed in successfully' do
          state = start_flow
          stub_exchange('user-token')

          get '/sidekiq', params: { code: 'an-authorization-code', state: state }

          expect(response).to have_http_status(:not_found)
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        it 'refuses a mismatched state' do
          start_flow
          stub_exchange('admin-token')

          get '/sidekiq', params: { code: 'an-authorization-code', state: 'not-the-state' }

          expect(response).to have_http_status(:not_found)
        end

        it 'refuses a code with no flow in the session' do
          stub_exchange('admin-token')

          get '/sidekiq', params: { code: 'an-authorization-code', state: 'anything' }

          expect(response).to have_http_status(:not_found)
        end

        it 'refuses when the token endpoint rejects the exchange' do
          state = start_flow
          failed = instance_double(Net::HTTPBadRequest, body: '{}')
          allow(failed).to receive(:is_a?).with(Net::HTTPSuccess).and_return(false)
          allow(Net::HTTP).to receive(:post_form).and_return(failed)

          get '/sidekiq', params: { code: 'an-authorization-code', state: state }

          expect(response).to have_http_status(:not_found)
        end
      end

      # SidekiqAdminConstraint includes ApplicationAuthenticationConcern, which memoises the decoded
      # token per instance. Were the router to hold one shared constraint object, the first admin
      # through would be remembered and everyone after them would inherit that identity.
      it 'does not carry one request\'s identity into the next' do
        get '/sidekiq', headers: bearer('admin-token')
        expect(response).to have_http_status(:ok)

        get '/sidekiq', headers: bearer('user-token')
        expect(response).to have_http_status(:not_found)

        get '/sidekiq'
        expect(response).to have_http_status(:redirect)
      end
    end

    def redirect_query
      CGI.parse(URI.parse(response.location).query.to_s)
    end

    def bearer(token)
      { 'Authorization' => "Bearer #{token}" }
    end

    # Mirrors ApplicationUserConcern#add_token_to_cookie: a browser's copy of the access token is an
    # encrypted, httponly cookie, so build one exactly as the app writes it. The ciphertext has to
    # be escaped the way Rails escapes it on the way out, otherwise any '+' it happens to contain
    # is read back as a space and decryption fails for roughly half of all generated tokens.
    def access_token_cookie(token)
      env = Rack::MockRequest.env_for('/', 'HTTP_HOST' => 'test.host').merge(Rails.application.env_config)
      jar = ActionDispatch::Cookies::CookieJar.build(ActionDispatch::Request.new(env), {})
      jar.encrypted[:access_token] = token

      { 'HTTP_COOKIE' => "access_token=#{Rack::Utils.escape(jar[:access_token])}" }
    end
  end
end
