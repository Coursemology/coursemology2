module Extensions::ActionView::Helpers::FormHelper
  def self.included(module_)
    module_.alias_method_chain :form_for, :resource
  end

  def form_for_with_resource(record, options, &proc)
    case options[:resource]
    when Symbol
      raise ArgumentError, ':resource and :url cannot be specified simultaneously' if options[:url]
      helper_module = Extensions::ActionView::Helpers::FormHelper
      helper = helper_module.url_helper_for_resource(record, options.delete(:resource))
      options[:url] = send(helper, *record)
    when nil
    else
      raise ArgumentError, 'Resource must be a symbol with the stem of route helper'
    end

    form_for_without_resource(record, options, &proc)
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
    suffix =
      if ['path', 'url'].include?(components.last)
        components.pop
      else
        'path'
      end
    name = components.pop
    name =
      if plural
        name.pluralize
      else
        name.singularize
      end
    components.push(name, suffix)
    components.join('_').to_sym
  end
end
