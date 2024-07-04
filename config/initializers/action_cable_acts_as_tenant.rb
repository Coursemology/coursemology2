# frozen_string_literal: true
module ActionCable::ActsAsTenantFilterConcern
  extend ActiveSupport::Concern

  private

  # rubocop:disable Naming/AccessorMethodName
  def set_current_tenant(current_tenant_object)
    ActsAsTenant.current_tenant = current_tenant_object
    ActsAsTenant.test_tenant = current_tenant_object
  end
  # rubocop:enable Naming/AccessorMethodName
end

module ActionCable::ActsAsTenantExtensions
  def set_current_tenant_through_filter
    include ActionCable::ActsAsTenantFilterConcern
  end
end

# Adds support for ActsAsTenant's `set_current_tenant_through_filter`
# in Action Cable channels.
#
# Adapted from https://github.com/ErwinM/acts_as_tenant/pull/280
ActiveSupport.on_load(:action_cable_channel) do |base|
  base.extend ActionCable::ActsAsTenantExtensions
  base.include ActsAsTenant::TenantHelper
end
