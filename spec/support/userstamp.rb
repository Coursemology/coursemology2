# frozen_string_literal: true
ActsAsTenant.with_tenant(Instance.default) do
  # Create a global stamper for this spec run
  User.stamper = User.human_users.first
end
