# frozen_string_literal: true
ActsAsTenant.configure do |config|
  # We need to specify a tenant.
  config.require_tenant = true
end
