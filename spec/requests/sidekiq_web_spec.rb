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

      # Neither route matches, so the router raises ActionController::RoutingError and the exception
      # middleware turns it into a 404 - the same answer as any path the app does not serve, which
      # is the point: the dashboard is not advertised to people who cannot open it.
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

      context 'when the user is not signed in' do
        it 'redirects to the sign in page, returning here afterwards' do
          get '/sidekiq'

          # See Other, so the browser fetches the sign in page with GET and does not cache its way
          # past the dashboard once signed in.
          expect(response).to have_http_status(:see_other)
          expect(response).to redirect_to('/users/sign_in?next=%2Fsidekiq')
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        # A session that lapses while the dashboard is open should send its owner to sign in, not
        # 404 them the moment they press one of its buttons.
        WRITE_METHODS.each do |method|
          it "redirects #{method.to_s.upcase} requests to the sign in page" do
            public_send(method, '/sidekiq/retries')

            expect(response).to have_http_status(:see_other)
            expect(response).to redirect_to('/users/sign_in?next=%2Fsidekiq%2Fretries')
            expect(Sidekiq::Web).to_not have_received(:call)
          end
        end

        it 'preserves the requested path and query in the next URL' do
          get '/sidekiq/retries?count=25'

          expect(response).to redirect_to('/users/sign_in?next=%2Fsidekiq%2Fretries%3Fcount%3D25')
          expect(Sidekiq::Web).to_not have_received(:call)
        end

        it 'redirects when the token is not one the auth server recognises' do
          get '/sidekiq', headers: bearer('forged-token')

          expect(response).to redirect_to('/users/sign_in?next=%2Fsidekiq')
          expect(Sidekiq::Web).to_not have_received(:call)
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
        expect(response).to redirect_to('/users/sign_in?next=%2Fsidekiq')
      end
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
