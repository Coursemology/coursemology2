# frozen_string_literal: true
class DeviseMailer < ActionMailer::Base
  before_action :set_mailers_url_host

  def set_mailers_url_host
    current_tenant = ActsAsTenant.current_tenant
    if Rails.env.production?
      # we setup the URL for Devise related action into the tenant's host address
      # (for example, xxx.coursemology.org)
      ActionMailer::Base.default_url_options[:host] = current_tenant.host
    else
      # for development and test, we setup it to follow the following convention
      # "{tenant}.lvh.me:8080", assuming that the URL used for testing / developing is lvh.me
      # for development, client_port is 8080 and for test, it is 3200
      # for more information, you might refer to config/environments/{test,development}.rb
      ActionMailer::Base.default_url_options[:host] = setup_host_for_non_production_env(current_tenant)
    end
  end

  private

  def setup_host_for_non_production_env(current_tenant)
    if current_tenant.default?
      default_app_host
    else
      tenant_host_address(current_tenant)
    end
  end

  def default_app_host
    return nil if Rails.env.production?

    Application::Application.config.x.initial_host
  end

  def tenant_host_address(current_tenant)
    # format return: xxx.lvh.me:8080, assuming the app is hosted in lvh.me and port is 8080
    tenant = current_tenant.host.split('.').first
    "#{tenant}.#{default_app_host}"
  end
end
