# frozen_string_literal: true
class KeycloakAdminService
  class << self
    delegate :push_redirect_uris, to: :new
  end

  def push_redirect_uris
    frontend_client_uuid = keycloak_frontend_client_uuid(access_token)
    raise "Keycloak frontend client not found for client_id: #{frontend_client_id}" if frontend_client_uuid.blank?

    service = "clients/#{frontend_client_uuid}"
    redirect_uris = Instance.all.map(&method(:keycloak_redirect_uri))
    Keycloak::Admin.generic_put(service, nil, { redirectUris: redirect_uris }, access_token)
  end

  # this is called "Home URL" in the keycloak UI, but the json field is "baseUrl"
  def push_base_url
    frontend_client_uuid = keycloak_frontend_client_uuid(access_token)
    raise "Keycloak frontend client not found for client_id: #{frontend_client_id}" if frontend_client_uuid.blank?

    service = "clients/#{frontend_client_uuid}"
    base_url = Instance.default.redirect_uri
    Keycloak::Admin.generic_put(service, nil, { baseUrl: base_url }, access_token)
  end

  private

  def frontend_client_id
    Rails.application.credentials.dig(:keycloak, :frontend, :client_id)
  end

  def access_token
    unless @access_token
      client_id = Rails.application.credentials.dig(:keycloak, :backend, :client_id)
      client_secret = Rails.application.credentials.dig(:keycloak, :backend, :client_secret)
      credentials = Keycloak::Client.get_token_by_client_credentials(client_id, client_secret)
      @access_token = JSON.parse(credentials)['access_token']
    end

    @access_token
  end

  def keycloak_frontend_client_uuid(access_token)
    clients = Keycloak::Admin.get_clients({ clientId: frontend_client_id }, access_token)
    JSON.parse(clients).dig(0, 'id')
  end

  def keycloak_redirect_uri(instance)
    "#{instance.redirect_uri}/*"
  end
end
