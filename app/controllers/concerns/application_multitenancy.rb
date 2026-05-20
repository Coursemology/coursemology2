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

    if instance.default? && tenant_host.casecmp(Instance.default.host) != 0
      raise ActionController::RoutingError, 'Instance Not Found'
    end

    instance
  end

  # Deduces the current host. We strip any leading www from the host.
  # @return [String] The host, with www removed.
  def deduce_tenant_host
    stripped_host = normalize_tenant_host(request.host)
    default_host = normalize_tenant_host(Instance.default.host)

    if default_host && stripped_host == default_host
      Instance.default.host
    elsif default_host && stripped_host.ends_with?(default_host)
      stripped_host.sub(default_host, 'coursemology.org')
    else
      stripped_host
    end
  end

  # We store "host" strings in database without port modifiers,
  # even when Coursemology is configured with them as part of the host (in local development).
  def normalize_tenant_host(host)
    return nil unless host

    (host.starts_with?('www.') ? host[4..] : host).gsub(/:\d+$/, '').downcase
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
