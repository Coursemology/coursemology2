# frozen_string_literal: true
RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods

  # Check that the factories are all valid.
  config.before(:suite) do
    # In case any factory involves Acts as Tenant
    ActsAsTenant.with_tenant(Instance.default) do
      FactoryGirl.lint
    end
  end
end
