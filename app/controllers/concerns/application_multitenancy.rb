# frozen_string_literal: true
module ApplicationMultitenancy
  private

  def deduce_and_set_current_tenant
    tenant = deduce_tenant
    ActsAsTenant.current_tenant = tenant
    ActsAsTenant.test_tenant = tenant
  end

  # Deduces the tenant from the host specified in the HTTP Request.
  # @return [Instance] The current tenant.
  # @return [nil] If there is no current tenant.
  def deduce_tenant
    tenant_host = deduce_tenant_host
    instance = Instance.find_tenant_by_host_or_default(tenant_host)

    if Rails.env.production? && instance.default? && instance.host.casecmp(tenant_host) != 0
      raise InstanceNotFoundError
    end

    instance
  end

  # Deduces the current host. We strip any leading www from the host.
  # @return [String] The host, with www removed.
  def deduce_tenant_host
    if Rails.env.development?
      default_app_host = Application::Application.config.x.default_app_host

      if request.host.downcase.ends_with?(default_app_host)
        request.host.sub(default_app_host, 'coursemology.org')
      else
        'coursemology.org'
      end
    elsif request.host.downcase.start_with?('www.')
      request.host[4..]
    else
      request.host
    end
  end

  module ClassMethods
    def set_current_tenant_through_filter
      super
      class_eval do
        private :set_current_tenant
      end
    end
  end
end
