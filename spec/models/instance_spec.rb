# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Instance do
  it { is_expected.to have_many(:instance_users).dependent(:destroy) }
  it { is_expected.to have_many(:users).through(:instance_users) }
  it do
    is_expected.to have_many(:announcements).class_name(Instance::Announcement.name).
      dependent(:destroy)
  end
  it { is_expected.to have_many(:courses).dependent(:destroy) }

  describe 'hostname validation' do
    context 'when hostname format is invalid' do
      hosts = ['example,com', 'www_.example.org', 'example_.org', 'example.org_',
               'example .org', 'example. org', 'example.org..']

      hosts.each do |invalid_host|
        context invalid_host do
          subject { build(:instance, host: invalid_host) }

          it { is_expected.not_to be_valid }
        end
      end
    end

    context 'when hostname format is valid' do
      hosts = ['example.ORG', 'www.example.org', 'ex-ample.org', 'example.org.sg']
      hosts.each do |valid_host|
        context valid_host do
          subject { build(:instance, host: valid_host) }

          it { is_expected.to be_valid }
        end
      end
    end

    context 'when hostname is too long' do
      subject { build(:instance, host: "#{'a' * 255}.com") }

      it { is_expected.not_to be_valid }
    end

    context 'when saving instance without modifying host' do
      it 'does not validate the host' do
        expect(Instance.default.save).to be_truthy
      end
    end
  end

  describe '.default' do
    it 'returns the default instance' do
      default_instance = Instance.default
      expect(default_instance.host).to eq(Application::Application.config.x.default_host)
      expect(default_instance.default?).to be_truthy
    end
  end

  describe '.order_for_display' do
    let!(:instances) { create_list(:instance, 2) }
    # Use a name that comes before 'Default'
    let!(:instance) { create(:instance, name: 'Abc') }

    it 'orders the default instance first, then alphabetically by name' do
      listing = Instance.order_for_display
      expect(listing.first).to eq Instance.default

      # Drop the 'Default' instance.
      listing = listing.drop(1)
      # Check that the rest of the names are ordered alphabetically.
      names = listing.map(&:name)
      expect(names.length).to be > 1
      expect(names.each_cons(2).all? { |a, b| a <= b }).to be_truthy
    end
  end

  describe '#containing_user' do
    let(:instances) { create_list(:instance, 5) }
    let(:instances_with_user) { instances[0..2] }
    let(:user) { create(:user) }

    before do
      instances_with_user.each do |instance|
        ActsAsTenant.with_tenant(instance) do
          InstanceUser.create(instance: instance, user: user)
        end
      end
    end

    it 'returns the correct set of instances' do
      ActsAsTenant.without_tenant do
        expect(Instance.containing_user(user)).to contain_exactly(*instances_with_user)
      end
    end
  end

  describe '.find_tenant_by_host' do
    let(:instances) { create_list(:instance, 3) }

    it 'finds the correct tenant if the host is correct' do
      found_instance = Instance.find_tenant_by_host(instances.first.host)
      expect(found_instance).to eq(instances.first)
    end
  end

  describe '.find_tenant_by_host_or_default' do
    let(:instances) { create_list(:instance, 3) }

    it 'finds the correct tenant if the host is correct' do
      found_instance = Instance.find_tenant_by_host_or_default(instances.first.host)
      expect(found_instance).to eq(instances.first)
    end

    it 'defaults to the default host if the host is not found' do
      found_instance = Instance.find_tenant_by_host_or_default('some-website.com')
      expect(found_instance).to eq(Instance.default)
    end
  end

  describe '#redirect_uri' do
    around do |example|
      orig_hostname = ENV.fetch('RAILS_HOSTNAME', nil)
      orig_use_http = ENV.fetch('RAILS_USE_HTTP', nil)
      example.run
    ensure
      orig_hostname.nil? ? ENV.delete('RAILS_HOSTNAME') : (ENV['RAILS_HOSTNAME'] = orig_hostname)
      orig_use_http.nil? ? ENV.delete('RAILS_USE_HTTP') : (ENV['RAILS_USE_HTTP'] = orig_use_http)
    end

    context 'when the instance is the default instance' do
      subject(:instance) { Instance.default }

      context 'when RAILS_HOSTNAME is not set' do
        before { ENV.delete('RAILS_HOSTNAME') }

        it 'falls back to https://localhost:8080' do
          expect(instance.redirect_uri).to eq('https://localhost:8080')
        end
      end

      context 'when RAILS_HOSTNAME is "coursemology.org"' do
        before { ENV['RAILS_HOSTNAME'] = 'coursemology.org' }

        it 'returns https://coursemology.org' do
          expect(instance.redirect_uri).to eq('https://coursemology.org')
        end
      end

      context 'when RAILS_HOSTNAME is "staging.coursemology.org"' do
        before { ENV['RAILS_HOSTNAME'] = 'staging.coursemology.org' }

        it 'returns https://staging.coursemology.org' do
          expect(instance.redirect_uri).to eq('https://staging.coursemology.org')
        end
      end

      context 'when RAILS_HOSTNAME is "lvh.me:8080"' do
        before { ENV['RAILS_HOSTNAME'] = 'lvh.me:8080' }

        it 'returns https://lvh.me:8080' do
          expect(instance.redirect_uri).to eq('https://lvh.me:8080')
        end
      end
    end

    context 'when the instance has host "coursemology.org"' do
      subject(:instance) { build(:instance, host: 'coursemology.org') }

      context 'when RAILS_HOSTNAME is not set' do
        before { ENV.delete('RAILS_HOSTNAME') }

        it 'falls back to https://localhost:8080' do
          expect(instance.redirect_uri).to eq('https://localhost:8080')
        end
      end

      context 'when RAILS_HOSTNAME is "coursemology.org"' do
        before { ENV['RAILS_HOSTNAME'] = 'coursemology.org' }

        it 'returns https://coursemology.org' do
          expect(instance.redirect_uri).to eq('https://coursemology.org')
        end
      end

      context 'when RAILS_HOSTNAME is "staging.coursemology.org"' do
        before { ENV['RAILS_HOSTNAME'] = 'staging.coursemology.org' }

        it 'returns https://staging.coursemology.org' do
          expect(instance.redirect_uri).to eq('https://staging.coursemology.org')
        end
      end
    end

    context 'when the instance has host "tenant.coursemology.org"' do
      subject(:instance) { build(:instance, host: 'tenant.coursemology.org') }

      context 'when RAILS_HOSTNAME is "coursemology.org"' do
        before { ENV['RAILS_HOSTNAME'] = 'coursemology.org' }

        it 'preserves the subdomain' do
          expect(instance.redirect_uri).to eq('https://tenant.coursemology.org')
        end
      end

      context 'when RAILS_HOSTNAME is "staging.coursemology.org"' do
        before { ENV['RAILS_HOSTNAME'] = 'staging.coursemology.org' }

        it 'maps the subdomain to the staging host' do
          expect(instance.redirect_uri).to eq('https://tenant.staging.coursemology.org')
        end
      end
    end

    describe 'protocol selection' do
      subject(:instance) { Instance.default }

      before { ENV.delete('RAILS_HOSTNAME') }

      context 'in a non-development environment' do
        it 'uses https' do
          expect(instance.redirect_uri).to start_with('https://')
        end
      end

      context 'in development without RAILS_USE_HTTP' do
        before do
          allow(Rails.env).to receive(:development?).and_return(true)
          ENV.delete('RAILS_USE_HTTP')
        end

        it 'uses https' do
          expect(instance.redirect_uri).to start_with('https://')
        end
      end

      context 'in development with RAILS_USE_HTTP set' do
        before do
          allow(Rails.env).to receive(:development?).and_return(true)
          ENV['RAILS_USE_HTTP'] = '1'
        end

        it 'uses http' do
          expect(instance.redirect_uri).to start_with('http://')
        end
      end
    end
  end

  describe '#push_redirect_uris_to_keycloak' do
    subject(:instance) { Instance.default }

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

    describe '#keycloak_frontend_client_uuid' do
      it 'queries Keycloak using the frontend client ID' do
        instance.push_redirect_uris_to_keycloak
        expect(Keycloak::Admin).to have_received(:get_clients).with({ clientId: frontend_client_id }, access_token)
      end

      it 'extracts the UUID from the first result' do
        instance.push_redirect_uris_to_keycloak
        expect(Keycloak::Admin).to have_received(:generic_put).
          with("clients/#{client_uuid}", anything, anything, anything)
      end

      context 'when the client list response is empty' do
        before do
          allow(Keycloak::Admin).to receive(:get_clients).and_return([].to_json)
        end

        it 'raises an error' do
          expect { instance.push_redirect_uris_to_keycloak }.
            to raise_error(RuntimeError, /Keycloak frontend client not found/)
        end
      end
    end

    it 'pushes redirect URIs for all instances' do
      instance.push_redirect_uris_to_keycloak
      expected_uris = Instance.all.map { |i| "#{i.redirect_uri}/*" }
      expect(Keycloak::Admin).to have_received(:generic_put).
        with("clients/#{client_uuid}", nil, { redirectUris: expected_uris }, access_token)
    end
  end

  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    describe '.active_course_count' do
      let!(:courses) { create_list(:course, 2, instance: instance) }
      let(:active_course) { courses.sample }
      # Make one of the courses active
      before do
        # Create another course user to ensure the result is correct after after joins
        create(:course_student, course: active_course)
        active_course.course_users.update_all(last_active_at: Time.zone.now)
      end

      subject { Instance.where(id: instance.id).calculated(:active_course_count).first }

      it 'shows the correct count' do
        expect(subject.active_course_count).to eq(1)
      end

      context 'when viewing from another instance' do
        let(:new_instance) { create(:instance) }
        it 'shows the correct count' do
          ActsAsTenant.with_tenant(new_instance) do
            expect(subject.active_course_count).to eq(1)
          end
        end
      end
    end

    describe '.course_count' do
      let!(:courses) { create_list(:course, 2, instance: instance) }
      subject { Instance.where(id: instance.id).calculated(:course_count).first }

      it 'shows the correct count' do
        expect(subject.course_count).to eq(courses.size)
      end

      context 'when viewing from another instance' do
        let(:new_instance) { create(:instance) }
        it 'shows the correct count' do
          ActsAsTenant.with_tenant(new_instance) do
            expect(subject.course_count).to eq(courses.size)
          end
        end
      end
    end

    describe '.active_user_count' do
      let!(:instance_users) { create_list(:instance_user, 2, instance: instance) }
      # Make one of the users active
      before { instance_users.sample.update_column(:last_active_at, Time.zone.now) }
      subject { Instance.where(id: instance.id).calculated(:active_user_count).first }

      it 'shows the correct count' do
        expect(subject.active_user_count).to eq(1)
      end

      context 'when viewing from another instance' do
        let(:new_instance) { create(:instance) }
        it 'shows the correct count' do
          ActsAsTenant.with_tenant(new_instance) do
            expect(subject.active_user_count).to eq(1)
          end
        end
      end
    end

    describe '.user_count' do
      let!(:users) { create_list(:instance_user, 3, instance: instance) }
      subject { Instance.where(id: instance.id).calculated(:user_count).first }

      it 'shows the correct count' do
        expect(subject.user_count).to eq(users.size)
      end

      context 'when viewing from another instance' do
        let(:new_instance) { create(:instance) }
        it 'shows the correct count' do
          ActsAsTenant.with_tenant(new_instance) do
            expect(subject.user_count).to eq(users.size)
          end
        end
      end
    end
  end
end
