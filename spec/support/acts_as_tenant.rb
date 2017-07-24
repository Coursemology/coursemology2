# frozen_string_literal: true
# Test group helpers for setting the tenant for tests.
module ActsAsTenant::TestGroupHelpers
  def self.build_host(instance)
    port = Capybara.current_session&.server&.port
    if port
      "http://#{instance.host}:#{port}"
    else
      "http://#{instance.host}"
    end
  end

  module ModelHelpers
    # Sets the current tenant when running this group of tests.
    #
    # @param [Symbol] tenant The symbol containing the tenant to use for this group of
    #   tests. The tenant must have been set using a let construct.
    # @param [Proc] proc The block containing the test definitions.
    def with_tenant(tenant, &proc)
      context "with tenant #{tenant.inspect}" do |*params|
        before(:each) do
          ActsAsTenant.current_tenant = send(tenant)
        end
        after(:each) do
          ActsAsTenant.current_tenant = nil
        end
        module_exec(*params, &proc)
      end
    end
  end

  module ControllerHelpers
    include ModelHelpers
    # Sets the current tenant and host when running this group of tests.
    #
    # @param [Symbol] tenant The symbol containing the tenant to use for this group of
    #   tests. The tenant must have been set using a let construct.
    # @param [Proc] proc The block containing the test definitions.
    def with_tenant(tenant, &proc)
      super(tenant) do |*params|
        before(:each) do
          @request.headers['host'] = send(tenant).host
        end
        module_exec(*params, &proc)
      end
    end
  end

  module FeatureHelpers
    include ModelHelpers
    # Sets the current tenant and host when running this group of tests.
    #
    # @param [Symbol] tenant The symbol containing the tenant to use for this group of
    #   tests. The tenant must have been set using a let construct.
    # @param [Proc] proc The block containing the test definitions.
    def with_tenant(tenant, &proc)
      super(tenant) do |*params|
        before(:each) do
          @saved_host = Capybara.app_host
          # Capybara's app_host is for remote testing, it's not recommend to change it for
          # multiple times. However, currently we cannot find a better way to do this
          Capybara.app_host = ActsAsTenant::TestGroupHelpers.build_host(send(tenant))
        end
        after(:each) { Capybara.app_host = @saved_host }

        module_exec(*params, &proc)
      end
    end
  end
end

module ActsAsTenant::CapybaraHelpers
  module BrowserHelpers
    # Unset the active tenant, let the request flow through the Rack stack and allow our own
    # code to deduce the tenant from the host name.
    def process(*)
      ActsAsTenant.with_tenant(nil) do
        super
      end
    end
  end
end
Capybara::RackTest::Browser.prepend(ActsAsTenant::CapybaraHelpers::BrowserHelpers)

RSpec.configure do |config|
  config.extend ActsAsTenant::TestGroupHelpers::ModelHelpers
  config.extend ActsAsTenant::TestGroupHelpers::ControllerHelpers, type: :controller
  config.extend ActsAsTenant::TestGroupHelpers::FeatureHelpers, type: :feature

  config.backtrace_exclusion_patterns << /\/spec\/support\/acts_as_tenant\.rb/
end
