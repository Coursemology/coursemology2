# frozen_string_literal: true

ActionMailer::Base.smtp_settings = {
  address: ENV['SMTP_SERVER'],
  port: ENV['SMTP_PORT'],
  authentication: :plain,
  domain: ENV['SMTP_DOMAIN'],
  user_name: ENV['SMTP_USER'],
  password: ENV['SMTP_PASSWORD']
}
