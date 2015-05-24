# Adds extra matchers for Capybara
module Capybara::TestGroupHelpers
  module FeatureHelpers
    # Finds the given form with the given selector and target.
    #
    # @param selector [String|nil] The selector to find the form with.
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
end
