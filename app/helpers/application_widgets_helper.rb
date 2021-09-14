# frozen_string_literal: true
module ApplicationWidgetsHelper
  # Create a +new+ button.
  #
  # @return [String] The HTML for the button.
  # @overload new_button(path, html_options = nil, &block)
  #   Creates a +new+ button, pointing to the given path and HTML options. This would yield a
  #   button with an icon, unless a block is provided.
  #   @param [String] path The path to link to.
  #   @param [Hash] html_options The HTML options for the button.
  #   @param [Proc] block The block to use for displaying the link.
  # @overload new_button(resource, html_options = nil, &block)
  #   Creates a +new+ button, pointing to the given resource. The URL is resolved using +url_for+.
  #   This would yield a button with an icon, unless a block is provided.
  #   @param [Array|Object] path The resource to link to.
  #   @param [Hash] html_options The HTML options for the button.
  #   @param [Proc] block The block to use for displaying the link.
  # @overload new_button(body, path, html_options = nil)
  #   Creates a +new+ button, pointing to the given path and HTML options. This would create a
  #   button with the given body.
  # @overload new_button(body, resource, html_options = nil)
  #   Creates a +new+ button, pointing to the given resource. The URL is resolved using +url_for+.
  #   This would create a button with the given body.
  def new_button(name, options = nil, html_options = nil, &block)
    name, options, html_options = [nil, name, options] unless html_options
    options = [:new] + Array(options) unless options.is_a?(String)
    block ||= proc { fa_icon 'file' }
    resource_button(:new, 'btn-primary', name || block, options, html_options&.dup)
  end

  # Create a +edit+ button.
  #
  # @return [String] The HTML for the button.
  # @overload edit_button(path, html_options = nil, &block)
  #   Creates a +edit+ button, pointing to the given path and HTML options. This would yield a
  #   button with an icon, unless a block is provided.
  #   @param [String] path The path to link to.
  #   @param [Hash] html_options The HTML options for the button.
  #   @param [Proc] block The block to use for displaying the link.
  # @overload edit_button(resource, html_options = nil, &block)
  #   Creates a +edit+ button, pointing to the given resource. The URL is resolved using +url_for+.
  #   This would yield a button with an icon, unless a block is provided.
  #   @param [Array|Object] path The resource to link to.
  #   @param [Hash] html_options The HTML options for the button.
  #   @param [Proc] block The block to use for displaying the link.
  # @overload edit_button(body, path, html_options = nil)
  #   Creates a +edit+ button, pointing to the given path and HTML options. This would create a
  #   button with the given body.
  # @overload edit_button(body, resource, html_options = nil)
  #   Creates a +edit+ button, pointing to the given resource. The URL is resolved using +url_for+.
  #   This would create a button with the given body.
  def edit_button(name, options = nil, html_options = nil, &block)
    name, options, html_options = [nil, name, options] unless html_options
    options = [:edit] + Array(options) unless options.is_a?(String)
    block ||= proc { fa_icon 'edit' }
    resource_button(:edit, 'btn-default', name || block, options, html_options&.dup)
  end

  # Create a +delete+ button.
  #
  # @return [String] The HTML for the button.
  # @overload delete_button(path, html_options = nil, &block)
  #   Creates a +delete+ button, pointing to the given path and HTML options. This would yield a
  #   button with an icon, unless a block is provided.
  #   @param [String] path The path to link to.
  #   @param [Hash] html_options The HTML options for the button.
  #   @param [Proc] block The block to use for displaying the link.
  # @overload delete_button(resource, html_options = nil, &block)
  #   Creates a +delete+ button, pointing to the given resource. The URL is resolved using
  #   +url_for+. This would yield a button with an icon, unless a block is provided.
  #   @param [Array|Object] path The resource to link to.
  #   @param [Hash] html_options The HTML options for the button.
  #   @param [Proc] block The block to use for displaying the link.
  # @overload delete_button(body, path, html_options = nil)
  #   Creates a +delete+ button, pointing to the given path and HTML options. This would create a
  #   button with the given body.
  # @overload delete_button(body, resource, html_options = nil)
  #   Creates a +delete+ button, pointing to the given resource. The URL is resolved using
  #   +url_for+. This would create a button with the given body.
  def delete_button(name, options = nil, html_options = nil, &block)
    name, options, html_options = [nil, name, options] unless html_options
    block ||= proc { fa_icon 'trash' }

    html_options = html_options&.dup || {}
    html_options.reverse_merge!(method: :delete,
                                data: { confirm: t('helpers.buttons.delete_confirm_message') })
    resource_button(:delete, 'btn-danger', name || block, options, html_options)
  end

  # Display a progress_bar with the given percentage and styling. The percentage is assumed to
  # be a number ranging from 0-100. In addition, a block can be passed to add custom text.
  #
  # ActionView::Helpers::CaptureHelper#capture is used to ensure the block is rendered in the
  # original view_context, rather than within the view_context of the progress bar layout.
  #
  # @param [Integer] percentage The percentage to be displayed on the progress bar.
  # @param [Hash] opts Options to apply on the progress bar. Supports the following:
  #                    class: css classes of progress bar (defaults to `progress-bar-info`),
  #                    tooltip_text: text to be included in tooltip,
  #                    tooltip_placement: 'left', 'top', 'bottom', or 'right'.
  # @yield The HTML text which will be passed to the partial as text to be shown in the bar.
  # @return [String] HTML string to render the progress bar.
  def display_progress_bar(percentage, opts = {}, &block)
    opts[:class] = ['progress-bar-info'] unless opts[:class]
    text_in_block = capture(&block) if block_given?
    render partial: 'layouts/progress_bar',
           locals: { percentage: percentage, opts: opts, progress_bar_text: text_in_block }
  end

  private

  # Creates a button for creating, editing, or deleting resources.
  #
  # @param [Symbol] key The key of the button. This can be +:new+, +:edit+, or +:delete+, and is
  #   used to look up an appropriate translation.
  # @param [String] default_class The default CSS class to be applied to the button.
  # @param [String|Proc] body The string to use as the body of the button, or a block which would
  #   be evaluated to give the body of the button.
  # @param [Hash|nil] url_options The options to pass to +url_for+.
  # @param [Hash|nil] html_options A hash of mutable options to pass to +link_to+.
  def resource_button(key, default_class, body, url_options, html_options)
    html_options ||= {}
    html_options[:class] = deduce_resource_button_class(key, html_options[:class], default_class)
    if !url_options.nil? && !url_options.is_a?(String)
      html_options[:title] ||= deduce_resource_button_title(key, url_options)
    end

    if body.is_a?(Proc)
      link_to(url_options, html_options, &body)
    else
      link_to(body, url_options, html_options)
    end
  end

  # Deduce the CSS classes to be applied to the button from the user-specified classes and default
  # class.
  #
  # @param [String|Symbol] key The key of the button, as passed to +resource_button+.
  # @param [Array<String>] custom_classes The CSS classes specified by the user.
  # @param [String] default_type The default class to use if there is no explicit button class.
  # @return [Array<String>] The deduced set of CSS classes to apply.
  def deduce_resource_button_class(key, custom_classes, default_type)
    custom_classes = Set[*custom_classes]
    custom_classes |= ['btn'].freeze
    custom_classes << default_type unless resource_button_type_specified?(custom_classes)
    custom_classes << key
    custom_classes.to_a
  end

  # Checks whether the given CSS classes have an explicit button type specified.
  #
  # @param [Set<String>] css_classes The list of CSS classes specified.
  # @return [Boolean] +true+ if the button type is specified.
  def resource_button_type_specified?(css_classes)
    available_button_types = Set['btn-default', 'btn-primary', 'btn-success',
                                 'btn-info', 'btn-warning', 'btn-danger'].freeze
    css_classes.intersect?(available_button_types)
  end

  # Deduces the title to be given to the button given the button type and the URL arguments.
  #
  # @param [Symbol] button_type The type of the button to generate a title for.
  # @param [Symbol|Array|ActiveRecord::Base] resource The resource to deduce the title for.
  def deduce_resource_button_title(button_type, resource)
    resource = deduce_resource_button_resource(resource)
    object_name = deduce_resource_object_name(resource)
    resource_name = resource.try(:model_name).try(:human) || object_name.humanize

    keys = []
    keys << :"helpers.buttons.#{object_name}.#{button_type}" if object_name
    keys << :"helpers.buttons.#{button_type}"
    keys << "#{button_type.to_s.humanize} #{resource_name}" if resource_name
    t(keys.shift, model: resource_name, default: keys)
  end

  # Given a parameter set for +url_for+, deduce the resource that the parameter references.
  #
  # @param [Array|String] resource The resource to deduce. This handles arrays, which are
  #   interpreted as +url_for+ parameters. This also supports hash options to be provided to
  #   +url_for+.
  # @return [Symbol] When an array is given.
  # @return [String] When a string is given.
  def deduce_resource_button_resource(resource)
    return resource unless resource.is_a?(Array)
    return resource[-2] if resource.last.is_a?(Hash)

    resource.last
  end

  # Deduces the object name of the resource. This is the name used to construct the translation
  # string and is also used as a name for sending form data.
  #
  # @param [Symbol|ActiveRecord::Base] resource The resource to deduce the title for.
  # @return [String] The object name of the resource.
  def deduce_resource_object_name(resource)
    if resource.is_a?(Symbol)
      resource.to_s
    else
      model_name_from_record_or_class(resource).param_key
    end
  end
end
