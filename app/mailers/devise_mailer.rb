# frozen_string_literal: true
class DeviseMailer < ActionMailer::Base
  before_action :set_mailers_url_host

  def set_mailers_url_host
    return unless Rails.env.production?

    ActionMailer::Base.default_url_options[:host] = ActsAsTenant.current_tenant.host
  end
end
