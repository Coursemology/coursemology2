# frozen_string_literal: true

require 'selenium/webdriver'

# How to make the screen bigger,  window-size=2500,2500
# Capybara.register_driver :selenium_chrome_headless do |app|
#   capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
#     chromeOptions: { args: %w(headless disable-gpu) }
#   )
#   Capybara::Selenium::Driver.new app, browser: :chrome, desired_capabilities: capabilities
# end

Capybara.javascript_driver = :selenium_chrome_headless

module Capybara::TestGroupHelpers
  module FeatureHelpers
    # Finds the given form with the given selector and target.
    #
    # @param [String|nil] selector The selector to find the form with.
    def find_form(selector, action: nil)
      attribute_selector =
        if action
          format('[action="%<action>s"]', action: action)
        else
          ''
        end

      result = find("form#{attribute_selector}")
      selector ? result.find(selector) : result
    end

    def wait_for_ajax
      Timeout.timeout(Capybara.default_max_wait_time) do
        sleep 0.1 until page.evaluate_script('jQuery.active').zero?
      end
    end

    def accept_confirm_dialog
      expect(page).to have_selector('button.confirm-btn')
      find('button.confirm-btn').click
      yield if block_given?
      wait_for_ajax
      expect(page).to have_no_selector('button.confirm-btn')
    end

    # Special helper to fill in draftjs textarea defined by react.
    #
    # Selector should specify the class of the target +textarea+, and method targets the +div+
    # within. This should change when the internals of the summernote react component is changed.
    def fill_in_react_ck(selector, text)
      react_selector = ' + div.react-ck > div.ck-editor > div.ck-editor__main > div.ck-content'
      find(selector + react_selector).set(text)
    end

    # Helper to fill in summernote textareas. Only to be used where javascript is enabled.
    #
    # The method provides an alternative method to fill up the textarea, which would
    # otherwise be very slow if capybara's +find+ and +set+ were used.
    def fill_in_summernote(selector, text)
      script = <<-JS
      var editorSelector = '#{selector}';
      $(editorSelector).summernote('reset');
      $(editorSelector).summernote('editor.insertText', '#{text}');
      JS
      execute_script(script)
    end

    # Special helper to fill in summernote textarea defined in rails.
    #
    # Selector should specify the class of the target +div+, and method targets the textarea within.
    def fill_in_rails_summernote(selector, text)
      rails_selector = ' textarea'
      fill_in_summernote(selector + rails_selector, text)
    end

    # Special helper to find a react-toastify message
    #
    # Since capybara's `find` has a default timeout until the element is found, this helps
    # to ensure certain changes are made before continuing with the tests.
    # NOTE: if there is more than one toast visible, the search will only return the first toast
    def expect_toastify(message)
      expect(page.find('div.Toastify__toast-body').text).to eq(message)
    end
  end
end

RSpec.configure do |config|
  config.include Capybara::TestGroupHelpers::FeatureHelpers, type: :feature
  config.define_derived_metadata do |meta|
    meta[:aggregate_failures] = true if !meta.key?(:aggregate_failures) && meta[:type] == :feature
  end

  config.backtrace_exclusion_patterns << /\/spec\/support\/capybara\.rb/
end

module Capybara::CustomFinders
  # Supplements find to try for alternative elements.
  def find(*args, **kwargs)
    super
  rescue Capybara::ElementNotFound
    result = try_find_ace(*args, **kwargs) || try_find_textarea(*args, **kwargs)
    raise unless result

    result
  end

  private

  # Tries to find a textarea converted to an Ace editor.
  #
  # We find the hidden node first, then we find the corresponding editor node.
  def try_find_ace(*args, **kwargs)
    options = args.extract_options!.dup
    return nil if options[:visible] == false

    options[:visible] = false
    args.push(options)

    textarea = find(*args, **kwargs)
    textarea.find(:xpath, 'following-sibling::*').find(:css, '.ace_text-input', visible: false)
  rescue Capybara::ElementNotFound
    nil
  end

  # Tries to find a textarea used by Summernote.
  #
  # We find the hidden node first, then we find the corresponding editor node.
  def try_find_textarea(*args, **kwargs)
    options = args.extract_options!.dup
    return nil if options[:visible] == false

    options[:visible] = false
    args.push(options)

    textarea = find(*args, **kwargs)
    textarea.find(:xpath, 'following-sibling::*').find(:css, '.note-editable')
  rescue Capybara::ElementNotFound
    nil
  end
end
Capybara::Node::Base.include(Capybara::CustomFinders)
