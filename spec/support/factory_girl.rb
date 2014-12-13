RSpec.configure do |config|
  config.include FactoryGirl::Syntax::Methods

  # Check that the factories are all valid.
  config.before(:suite) do
    # In case any factory involves Acts as Tenant
    ActsAsTenant.with_tenant(Instance.default) do
      begin
        DatabaseCleaner.start
        FactoryGirl.lint
      ensure
        DatabaseCleaner.clean
      end
    end
  end
end
