# frozen_string_literal: true
require 'rails_helper'

# Runs against the live Keycloak (coursemology_test realm) that feature specs
# already require. Unlike spec/services/keycloak_admin_service_spec.rb, which
# mocks the gem, this checks the backend service account's actual roles: the
# admin calls Rails makes must succeed, and admin access beyond client
# management must be refused.
RSpec.describe 'Keycloak backend client privileges', :keycloak_integration do
  user_storage_type = 'org.keycloak.storage.UserStorageProvider'

  def credential(*path)
    Rails.application.credentials.dig(:keycloak, *path)
  end

  # A backend service-account token obtained the same way KeycloakAdminService does.
  def backend_access_token
    response = Keycloak::Client.get_token_by_client_credentials(
      credential(:backend, :client_id), credential(:backend, :client_secret)
    )
    JSON.parse(response)['access_token']
  end

  describe 'Keycloak backend service account' do
    subject(:service) { KeycloakAdminService.new }

    # Every feature spec logs in through the frontend client, possibly from another process at the
    # same time, so the pushes must not change it. Each write still reaches Keycloak with the backend
    # token and needs manage-clients, but sends the client's current values for the fields it sets.
    before do
      allow(Keycloak::Admin).to receive(:generic_put).and_wrap_original do |original, path, params, payload, token|
        current = JSON.parse(Keycloak::Admin.generic_get(path, nil, token))
        original.call(path, params, current.slice(*payload.keys.map(&:to_s)), token)
      end
    end

    it 'pushes the base URL without error (view-clients + manage-clients)' do
      expect { service.push_base_url }.not_to raise_error
      expect(Keycloak::Admin).to have_received(:generic_put).once
    end

    it 'pushes redirect URIs without error (view-clients + manage-clients)' do
      expect { service.push_redirect_uris }.not_to raise_error
      expect(Keycloak::Admin).to have_received(:generic_put).once
    end

    it 'is forbidden from reading user-storage components (no realm-admin)' do
      token = backend_access_token
      expect(token).to be_present

      begin
        Keycloak::Admin.generic_get(
          'components',
          { parent: Keycloak::Client.realm, type: user_storage_type },
          token
        )
        raise 'expected the component read to be forbidden, but it succeeded ' \
              '(service account still has realm-admin / manage-realm)'
      rescue RestClient::ExceptionWithResponse => e
        expect(e.http_code).to eq(403)
      end
    end
  end
end
