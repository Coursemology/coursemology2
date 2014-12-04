module ApplicationMultitenancyConcern
  extend ActiveSupport::Concern

  included do
    set_current_tenant_through_filter
    before_filter :deduce_and_set_current_tenant
  end

  private

  def deduce_and_set_current_tenant
    current_tenant = deduce_tenant
    if current_tenant then
      set_current_tenant(current_tenant)
    else
      set_current_tenant(Instance.default)
    end
  end

  # Deduces the tenant from the host specified in the HTTP Request.
  # @return [Instance|nil] The current tenant, or nil
  def deduce_tenant
    tenant_host = deduce_tenant_host
    Instance.find_tenant_by_host(tenant_host)
  end

  # Deduces the current host. We strip any leading www from the host.
  # @return [String] The host, with www removed.
  def deduce_tenant_host
    subdomain = request.subdomain
    if subdomain == 'www'
      request.domain
    else
      request.host
    end
  end
end
