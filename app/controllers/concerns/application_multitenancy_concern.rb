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

  def deduce_tenant
    tenant_hostname = deduce_tenant_hostname
    Instance.find_tenant_by_host(tenant_hostname)
  end

  def deduce_tenant_hostname
    subdomain = request.subdomain
    if subdomain == 'www'
      request.domain
    else
      request.host
    end
  end
end
