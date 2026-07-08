# frozen_string_literal: true
namespace :keycloak do
  # Run to update configuration on Keycloak side on non-production environments.
  task :push_redirect_uris, [:default_host_url] => :environment do |_, args|
    default_host_url = args[:default_host_url] || 'http://localhost:8080'

    Application::Application.config.x.default_host = default_host_url.gsub(/https?:\/\//, '')
    ENV['RAILS_USE_HTTP'] = '1' unless default_host_url.start_with?('https://')

    service = KeycloakAdminService.new
    service.push_base_url
    service.push_redirect_uris
  end
end
