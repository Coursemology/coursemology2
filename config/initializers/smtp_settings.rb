# frozen_string_literal: true

smtp_config = Rails.application.credentials[:smtp]
if smtp_config.present?
  ActionMailer::Base.smtp_settings = {
    # Override with environment variables in staging to trap emails in private SMTP server
    address: smtp_config[:server] || ENV['SMTP_SERVER'],
    port: smtp_config[:port] || ENV['SMTP_PORT'],
    authentication: :plain,
    domain: smtp_config[:domain],
    user_name: smtp_config[:username],
    password: smtp_config[:password]
  }
end
