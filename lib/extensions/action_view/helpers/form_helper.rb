module Extensions::ActionView::Helpers::FormHelper
  def self.included(module_)
    module_.alias_method_chain :form_for, :resource
  end

  def form_for_with_resource(record, options, &proc)
    Extensions::ActionView::Helpers::FormHelper.form_for_with_resource_option(self, record, options)

    form_for_without_resource(record, options, &proc)
  end

  # Handles the :resource option in form_for.
  def self.form_for_with_resource_option(form_helper, record, options)
    case options[:resource]
    when Symbol
      fail ArgumentError, ':resource and :url cannot be specified simultaneously' if options[:url]
      helper = url_helper_for_resource(record, options.delete(:resource))
      options[:url] = form_helper.send(helper, *record)
    when nil
    else
      fail ArgumentError, 'Resource must be a symbol with the stem of route helper'
    end
  end

  # Gets the URL for the record. This follows the pluralisation rules for Rails routes, where the
  # CREATE action is plural, and the PUT action is singular.
  #
  # @param record [Array<ActiveRecord::Base>|ActionRecord::Base] The record to build the route from.
  # @param helper [Symbol] The symbol with the stem of the URL helper.
  # @return [Symbol] The appropriate URL helper to call.
  def self.url_helper_for_resource(record, helper)
    resource = record
    resource = resource.last if resource.is_a?(Array)

    inflect_path(helper, resource.new_record?)
  end

  # Inflects the path according to the plurality specified.
  #
  # @param stem [Symbol] The path to inflect.
  # @param plural [Boolean] Whether to make the path plural.
  # @return [String] The stem, in the given plurality.
  def self.inflect_path(stem, plural)
    components = stem.to_s.underscore.split('_')
    components, suffix = parse_path_components(components)

    name = components.pop
    name = plural ? name.pluralize : name.singularize

    components.push(name, suffix)
    components.join('_').to_sym
  end

  # Splits the path helper into the suffix (_path, or _url), and the resource involved.
  #
  # @param [String] components the components of the path helper.
  # @return [Array<[String], String>] The list of components, with the suffix removed, followed by
  #                                   the suffix.
  def self.parse_path_components(components)
    if ['path', 'url'].include?(components.last)
      [components, components.pop]
    else
      [components, 'path']
    end
  end
end
