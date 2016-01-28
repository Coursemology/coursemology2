# frozen_string_literal: true
ActsAsTenant.with_tenant(Instance.default) do
  # Create a global stamper for this spec run
  User.stamper = User.where { users.id != User::SYSTEM_USER_ID }.first
end
