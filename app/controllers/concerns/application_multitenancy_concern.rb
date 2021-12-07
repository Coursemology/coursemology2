# frozen_string_literal: true
module ApplicationMultitenancyConcern
  extend ActiveSupport::Concern

  included do
    set_current_tenant_through_filter
    before_action :deduce_and_set_current_tenant

    helper_method :current_tenant
  end

  private

  def deduce_and_set_current_tenant
    set_current_tenant(deduce_tenant)
  end

  # Deduces the tenant from the host specified in the HTTP Request.
  # @return [Instance] The current tenant.
  # @return [nil] If there is no current tenant.
  def deduce_tenant
    tenant_host = deduce_tenant_host
    instance = Instance.find_tenant_by_host_or_default(tenant_host)

    if Rails.env.production? && instance && instance.default? &&
       instance.host.casecmp(tenant_host) != 0
      raise ActionController::RoutingError, 'Instance Not Found'
    end

    instance
  end

  # Deduces the current host. We strip any leading www from the host.
  # @return [String] The host, with www removed.
  def deduce_tenant_host
    if request.host.downcase.start_with?('www.')
      request.host[4..]
    else
      request.host
    end
  end

  module ClassMethods
    # :nodoc:
    def set_current_tenant_through_filter
      super
      class_eval do
        private :set_current_tenant
      end
    end
  end
end
