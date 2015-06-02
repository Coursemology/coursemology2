module ApplicationWidgetsHelper
  # Create a edit button with icon
  #
  # @param [String, Hash] options The url or the url options which will be passed to `link_to`.
  #
  # @param [Hash] html_options The options to specify the class and title of the button.
  # @return [String] The string including embedded HTML which displays the button with a link to
  #                  path.
  def edit_button(options, html_options = {})
    html_options = html_options.dup

    html_options[:class] = deduce_css_class(html_options[:class], 'btn-default')
    html_options[:title] ||= t('common.edit')

    link_to(options, html_options) do
      fa_icon 'edit'
    end
  end

  # Create a delete button with icon
  #
  # @param [String, Hash] options The url or the url options which will be passed to `link_to`.
  #
  # @param [Hash] html_options The options to specify the class and title of the button.
  # @return [String] The string including embedded HTML which displays the button with a link to
  #                  path.
  def delete_button(options, html_options = {})
    html_options = html_options.dup

    html_options[:class] = deduce_css_class(html_options[:class], 'btn-danger')
    html_options[:title] ||= t('common.delete')
    html_options[:data] ||= {}
    html_options[:data][:confirm] ||= t('common.delete_confirm')
    html_options[:method] ||= :delete

    link_to(options, html_options) do
      fa_icon 'trash'
    end
  end

  private

  # Deduce css classes of button from custom types and default type
  #
  # @param [Array<String>] custom_types types specified by user
  # @param [String] default_type default type to use if no custom type
  # @return [Array<String>] deduced css classes
  def deduce_css_class(custom_types, default_type)
    css_class = [*custom_types]
    css_class |= ['btn']
    css_class << default_type unless button_type_specified?(css_class)
    css_class
  end

  # Checks whether the given css_class have specified a button type or not
  #
  # @param [Array<String>] css_class the css classes to be checked
  # @return [Boolean] true if the button type is specified otherwise false
  def button_type_specified?(css_class)
    available_button_types = ['btn-default', 'btn-primary', 'btn-success',
                              'btn-info', 'btn-warning',  'btn-danger'].freeze
    css_class.find { |type| available_button_types.include?(type) } ? true : false
  end
end
