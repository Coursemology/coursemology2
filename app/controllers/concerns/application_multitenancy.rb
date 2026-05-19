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
      raise ActionController::RoutingError, 'Instance Not Found'
    end

    instance
  end

  # Deduces the current host. We strip any leading www from the host.
  # @return [String] The host, with www removed.
  def deduce_tenant_host
    stripped_host = request.host.downcase.start_with?('www.') ? request.host[4..] : request.host
    default_host = Application::Application.config.x.default_host&.gsub(/:\d+$/, '')

    if default_host && stripped_host.downcase.ends_with?(default_host)
      stripped_host.sub(default_host, 'coursemology.org')
    else
      stripped_host
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
