# frozen_string_literal: true
# Signs a visitor in to the Sidekiq dashboard, which SidekiqAdminConstraint has just turned away.
#
# The dashboard is mounted in the router and served by Rails, so an ordinary page visit carries no
# Authorization header - only the encrypted access_token cookie, which is written as a side effect
# of the client app's authenticated requests and holds a Keycloak access token that expires in
# minutes. A direct visit or a bookmark therefore routinely arrives with no usable credential even
# though the visitor is signed in to the app.
#
# Redirecting such a visitor to the client app's sign in page cannot fix that: they come back to a
# server-rendered page that still has no way to mint the cookie, and Keycloak's live SSO session
# makes the return trip instant, so it loops. Instead this runs the authorization code flow here,
# where the callback lands on Rails and the cookie can be written before the dashboard is served.
#
# PKCE, not a client secret: the frontend Keycloak client is public. The redirect URI needs no
# Keycloak change, since KeycloakAdminService already registers "#{instance.redirect_uri}/*".
class System::Admin::SidekiqSessionsController < ApplicationController
  SESSION_KEY = :sidekiq_authorization
  DASHBOARD_PATH = '/sidekiq'

  # Where the flow returns to. Must be one fixed, registered URI, so the path the visitor actually
  # asked for is carried in the session rather than in the redirect URI.
  def show
    return head :not_found unless request.get?

    return complete_authorization if params[:code].present?

    # Reaching here with a credential the app accepts means the constraint refused on the role, not
    # on the credential. Sending them round Keycloak would only return them to the same answer.
    return head :not_found if current_user.present?

    # An error handed back by Keycloak (a cancelled login, a rejected consent) must not restart the
    # flow, or the visitor bounces between here and the auth server.
    return head :not_found if params[:error].present?

    start_authorization
  end

  protected

  # Nothing here can require a signed-in user: the whole point is to obtain one.
  def publicly_accessible?
    true
  end

  private

  def start_authorization
    verifier = SecureRandom.urlsafe_base64(64, false)
    state = SecureRandom.urlsafe_base64(32, false)

    session[SESSION_KEY] = { 'verifier' => verifier, 'state' => state, 'return_to' => return_path }

    redirect_to authorization_url(state, code_challenge(verifier)), allow_other_host: true
  end

  def complete_authorization
    authorization = session.delete(SESSION_KEY)
    return head :not_found if authorization.blank?
    return head :not_found unless valid_state?(params[:state], authorization['state'])

    access_token = exchange_code(params[:code], authorization['verifier'])
    return head :not_found if access_token.blank?

    user = user_from(access_token)
    return head :not_found unless user&.administrator?

    # Mirrors ApplicationUserConcern#add_token_to_cookie, which is what the constraint reads.
    cookies.encrypted[:access_token] = { value: access_token, httponly: true, expires: 1.hour.from_now }

    redirect_to authorization['return_to'].presence || DASHBOARD_PATH
  end

  def user_from(access_token)
    response = Authentication::AuthenticationService.validate_token(access_token, :local)
    return nil if response.error

    email = response.decoded_token[:email]
    return nil if email.blank?

    User.joins(:emails).where('user_emails.email = ?', email).first
  end

  def exchange_code(code, verifier)
    response = Net::HTTP.post_form(URI.parse(token_endpoint),
                                   grant_type: 'authorization_code',
                                   code: code,
                                   redirect_uri: redirect_uri,
                                   client_id: client_id,
                                   code_verifier: verifier)
    return nil unless response.is_a?(Net::HTTPSuccess)

    JSON.parse(response.body)['access_token']
  rescue StandardError => e
    Rails.logger.warn("Sidekiq dashboard token exchange failed: #{e.class}")
    nil
  end

  def authorization_url(state, challenge)
    query = {
      client_id: client_id,
      redirect_uri: redirect_uri,
      response_type: 'code',
      # Exactly what the client app asks for. oidc-client-ts defaults to "openid" and AuthProvider's
      # oidcConfig sets no scope, so requesting the same keeps both flows' tokens identical in shape:
      # same audience, same claims, same validation. Asking for more risks an invalid_scope refusal
      # from Keycloak, or an `aud` that JwtVerificationService would then reject.
      scope: 'openid',
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256'
    }

    "#{authorization_endpoint}?#{query.to_query}"
  end

  def code_challenge(verifier)
    Base64.urlsafe_encode64(Digest::SHA256.digest(verifier), padding: false)
  end

  def valid_state?(received, expected)
    received.present? && expected.present? &&
      ActiveSupport::SecurityUtils.secure_compare(received.to_s, expected.to_s)
  end

  # Only ever a path under the dashboard, so a crafted `return_to` cannot turn this into an open
  # redirect or a way to reach some other part of the app with a freshly minted cookie.
  def return_path
    return DASHBOARD_PATH unless request.path == DASHBOARD_PATH || request.path.start_with?("#{DASHBOARD_PATH}/")

    request.fullpath
  end

  def redirect_uri
    "#{request.base_url}#{DASHBOARD_PATH}"
  end

  def client_id
    Rails.application.credentials.dig(:keycloak, :frontend, :client_id)
  end

  # chomp: the configured auth server URL may or may not carry a trailing slash (it does in the
  # test credentials), and "//realms/..." is not the same path to every proxy in front of Keycloak.
  def realm_url
    "#{Keycloak.auth_server_url.to_s.chomp('/')}/realms/#{Keycloak.realm}/protocol/openid-connect"
  end

  def authorization_endpoint
    "#{realm_url}/auth"
  end

  def token_endpoint
    "#{realm_url}/token"
  end
end
