# frozen_string_literal: true
require 'capybara/poltergeist'

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

    def wait_for_ajax
      Timeout.timeout(Capybara.default_max_wait_time) do
        sleep 0.1 until page.evaluate_script('jQuery.active').zero?
      end
    end

    def accept_confirm_dialog
      find('.confirm-btn').click
      find('.confirm-btn').click unless page.all('.confirm-btn').empty?
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

    # Special helper to fill in summernote textarea defined by react.
    #
    # Selector should specify the class of the target +textarea+, and method targets the +div+
    # within. This should change when the internals of the summernote react component is changed.
    def fill_in_react_summernote(selector, text)
      react_selector = ' + div.material-summernote > div > div[id^="react-summernote-"]'
      fill_in_summernote(selector + react_selector, text)
    end

    # Special helper to fill in summernote textarea defined in rails.
    #
    # Selector should specify the class of the target +div+, and method targets the textarea within.
    def fill_in_rails_summernote(selector, text)
      rails_selector = ' textarea'
      fill_in_summernote(selector + rails_selector, text)
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

Capybara.javascript_driver = :poltergeist

module Capybara::CustomFinders
  # Supplements find to try for alternative elements.
  def find(*args)
    super
  rescue Capybara::ElementNotFound
    result = try_find_ace(*args) || try_find_textarea(*args)
    raise unless result

    result
  end

  private

  # Tries to find a textarea converted to an Ace editor.
  #
  # We find the hidden node first, then we find the corresponding editor node.
  def try_find_ace(*args)
    options = args.extract_options!.dup
    return nil if options[:visible] == false

    options[:visible] = false
    args.push(options)

    textarea = find(*args)
    textarea.find(:xpath, 'following-sibling::*').find(:css, '.ace_text-input', visible: false)
  rescue Capybara::ElementNotFound
    nil
  end

  # Tries to find a textarea used by Summernote.
  #
  # We find the hidden node first, then we find the corresponding editor node.
  def try_find_textarea(*args)
    options = args.extract_options!.dup
    return nil if options[:visible] == false

    options[:visible] = false
    args.push(options)

    textarea = find(*args)
    textarea.find(:xpath, 'following-sibling::*').find(:css, '.note-editable')
  rescue Capybara::ElementNotFound
    nil
  end
end
Capybara::Node::Base.include(Capybara::CustomFinders)
