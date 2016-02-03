# frozen_string_literal: true
module ControllerExceptions; end

# Test group helpers for allowing exceptions from controller tests to be caught by specs.
module ControllerExceptions::TestGroupHelpers
  BYPASS_RESCUE_CONSTANT_NAME = :__controller_exceptions_test_group_helpers_bypass_rescue

  def self.extended(module_)
    module_.module_eval do
      let(BYPASS_RESCUE_CONSTANT_NAME) { true }
      before(:each) do
        bypass_rescue if send(BYPASS_RESCUE_CONSTANT_NAME)
      end
    end
  end

  def run_rescue
    let(BYPASS_RESCUE_CONSTANT_NAME) { false }
  end
end

RSpec.configure do |config|
  config.extend ControllerExceptions::TestGroupHelpers, type: :controller
end
