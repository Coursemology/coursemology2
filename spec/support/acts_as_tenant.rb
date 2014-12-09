# Test group helpers for setting the tenant for tests.
module ActsAsTenant::TestGroupHelpers
  # Sets the current tenant when running this group of tests.
  #
  # @param tenant [Symbol] The symbol containing the tenant to use for this group of
  #                        tests. The tenant must have been set using a let construct.
  # @param proc [Proc] The block containing the test definitions.
  def with_tenant(tenant, &proc)
    context "with tenant #{tenant.inspect}" do |*params|
      before(:each) do
        ActsAsTenant.current_tenant = send(tenant)
      end
      after(:each) do
        ActsAsTenant.current_tenant = nil
      end
      instance_exec(*params, &proc)
    end
  end
end

RSpec.configure do |config|
  config.extend ActsAsTenant::TestGroupHelpers, type: :model
end
