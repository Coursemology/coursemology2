# Adds extra matchers for Capybara
module Capybara::TestGroupHelpers
  module FeatureHelpers
    # Finds the given form with the given selector and target.
    #
    # @param [String|nil] selector The selector to find the form with.
    def find_form(selector, action: nil)
      attribute_selector =
        if action
          format('[action="%s"]', action)
        else
          ''.freeze
        end

      result = find('form' + attribute_selector)
      selector ? result.find(selector) : result
    end
  end
end

RSpec.configure do |config|
  config.include Capybara::TestGroupHelpers::FeatureHelpers, type: :feature
  config.define_derived_metadata do |meta|
    meta[:aggregate_failures] = true if !meta.key?(:aggregate_failures) && meta[:type] == :feature
  end
end
