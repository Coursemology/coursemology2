# frozen_string_literal: true
require 'rails_helper'

RSpec.describe KeycloakAdminService do
  subject(:service) { KeycloakAdminService.new }

  let(:access_token) { 'test-access-token' }
  let(:client_uuid) { 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee' }
  let(:frontend_client_id) { 'coursemology-frontend' }

  before do
    creds = Rails.application.credentials
    allow(creds).to receive(:dig).with(:keycloak, :backend, :client_id).and_return('backend-client')
    allow(creds).to receive(:dig).with(:keycloak, :backend, :client_secret).and_return('backend-secret')
    allow(creds).to receive(:dig).with(:keycloak, :frontend, :client_id).and_return(frontend_client_id)
    allow(Keycloak::Client).to receive(:get_token_by_client_credentials).
      and_return({ access_token: access_token }.to_json)
    allow(Keycloak::Admin).to receive(:get_clients).
      and_return([{ 'id' => client_uuid, 'clientId' => frontend_client_id }].to_json)
    allow(Keycloak::Admin).to receive(:generic_put).and_return(true)
  end

  shared_examples 'a Keycloak admin action' do
    it 'queries Keycloak using the frontend client ID' do
      subject_action
      expect(Keycloak::Admin).to have_received(:get_clients).with({ clientId: frontend_client_id }, access_token)
    end

    it 'targets the correct Keycloak client service path' do
      subject_action
      expect(Keycloak::Admin).to have_received(:generic_put).
        with("clients/#{client_uuid}", anything, anything, anything)
    end

    context 'when the client list response is empty' do
      before { allow(Keycloak::Admin).to receive(:get_clients).and_return([].to_json) }

      it 'raises an error' do
        expect { subject_action }.to raise_error(RuntimeError, /Keycloak frontend client not found/)
      end
    end
  end

  describe '#push_redirect_uris' do
    let(:subject_action) { service.push_redirect_uris }

    include_examples 'a Keycloak admin action'

    it 'pushes redirect URIs for all instances' do
      service.push_redirect_uris
      expected_uris = Instance.all.map { |i| "#{i.redirect_uri}/*" }
      expect(Keycloak::Admin).to have_received(:generic_put).
        with("clients/#{client_uuid}", nil, { redirectUris: expected_uris }, access_token)
    end
  end

  describe '#push_base_url' do
    let(:subject_action) { service.push_base_url }

    include_examples 'a Keycloak admin action'

    it 'pushes the default instance redirect URI as the base URL' do
      service.push_base_url
      expect(Keycloak::Admin).to have_received(:generic_put).
        with("clients/#{client_uuid}", nil, { baseUrl: Instance.default.redirect_uri }, access_token)
    end
  end
end
