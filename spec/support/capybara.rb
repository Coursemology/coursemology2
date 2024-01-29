# frozen_string_literal: true

require 'selenium/webdriver'

# How to make the screen bigger,  window-size=2500,2500
# Capybara.register_driver :selenium_chrome_headless do |app|
#   capabilities = Selenium::WebDriver::Remote::Capabilities.chrome(
#     chromeOptions: { args: %w(headless disable-gpu) }
#   )
#   Capybara::Selenium::Driver.new app, browser: :chrome, desired_capabilities: capabilities
# end

Capybara.javascript_driver = :selenium_chrome

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

    def accept_confirm_dialog(class_name = 'button.confirm-btn')
      expect(page).to have_selector(class_name)
      find(class_name).click
      yield if block_given?
      wait_for_ajax
      expect(page).to have_no_selector(class_name)
    end

    def accept_prompt
      accept_confirm_dialog('button.prompt-primary-btn')
    end

    # Special helper to fill in CKEditor textarea defined by react.
    #
    # Selector should specify the class of the target +textarea+, and method targets the +div+
    # within. This should change when the internals of the CKEditor react component is changed.
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

    # Special helper to fill in MUI DateTimePicker defined by react.
    def fill_in_mui_datetime(field_name, date)
      find_field(field_name).send_keys([:control, 'a']).send_keys(date)
    end

    # Special helper to find a react-toastify message
    #
    # Since capybara's `find` has a default timeout until the element is found, this helps
    # to ensure certain changes are made before continuing with the tests.
    def expect_toastify(message)
      wait_for_page # To ensure toast is open
      container = find_all('.Toastify').first
      expect(container).to have_text(message)
      find('p', text: message).click
    end

    # Finds a react-beautiful-dnd draggable element
    def find_rbd_with_draggable_id(draggable_id)
      find("div[data-rfd-draggable-id='#{draggable_id}']")
    end

    # Finds a react-beautiful-dnd draggable drag handle element
    #
    # Note that not all draggable elements have their entire element as the drag handle.
    # For example, an assessment category is a draggable, but only the header in which the
    # category title is contained is the drag handle.
    def find_rbd_with_drag_handle_id(drag_handle_id)
      find("div[data-rfd-drag-handle-draggable-id='#{drag_handle_id}']")
    end

    # Finds a react-beautiful-dnd draggable survey question
    def find_rbd_question(question_id)
      find_rbd_with_drag_handle_id("question-#{question_id}")
    end

    # Finds a react-beautiful-dnd draggable assessment category
    def find_rbd_category(category_id)
      find_rbd_with_drag_handle_id("category-#{category_id}")
    end

    # Finds a react-beautiful-dnd draggable assessment tab
    def find_rbd_tab(tab_id)
      find_rbd_with_draggable_id("tab-#{tab_id}")
    end

    # Drags a react-beautiful-dnd draggable from one to another element's location
    def drag_rbd(source, destination)
      page.driver.browser.action.move_to(source.native).
        click_and_hold.
        move_by(0, -5). # rbd needs a nudge to trigger
        move_to(destination.native).
        release.
        perform
    end

    def hover_then_click(element)
      element.hover
      element.click
    end

    def find_react_hook_form_error
      expect(page).to have_text('Failed submitting this form. Please try again.')
    end

    def find_sidebar
      all('aside').first
    end

    def expect_forbidden
      sleep 1 # wait for the page to load
      expect(page).to have_content("You don't have permission to access")
    end

    def confirm_registration_token_via_email
      token = ActionMailer::Base.deliveries.last.body.match(/confirmation_token=.*(?=")/)
      visit "/users/confirmation?#{token}"
      wait_for_page
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
