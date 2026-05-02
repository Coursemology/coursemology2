# frozen_string_literal: true
namespace :keycloak do
  task :push_redirect_uris, [:default_host_url] => :environment do |_, args|
    default_host_url = args[:default_host_url] || 'http://localhost:8080'

    ENV['RAILS_HOSTNAME'] = default_host_url.gsub(/https?:\/\//, '')
    ENV['RAILS_USE_HTTP'] = '1' unless default_host_url.start_with?('https://')

    Instance.new.push_redirect_uris_to_keycloak
  end
end
