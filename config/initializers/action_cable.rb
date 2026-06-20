# frozen_string_literal: true
Rails.application.configure do
  config.action_cable.mount_path = '/cable'
  # config.action_cable.url = 'ws://example.com:28080'
  config.action_cable.allowed_request_origins = [/^(https?:\/\/)?([^.\/]+\.)?#{ENV['RAILS_HOSTNAME']}/]
end
