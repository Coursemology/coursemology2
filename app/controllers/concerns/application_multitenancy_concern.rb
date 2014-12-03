module ApplicationMultitenancyConcern
  extend ActiveSupport::Concern

  included do
    set_current_tenant_through_filter
    before_filter :deduce_and_set_current_tenant
  end

  private

  def deduce_and_set_current_tenant
    tenant_hostname = deduce_tenant_hostname
    current_tenant = Instance.where {
      lower(host) == lower(tenant_hostname)
    }.take
    if current_tenant then
      set_current_tenant(current_tenant)
    else
      set_current_tenant(Instance.default)
    end
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
