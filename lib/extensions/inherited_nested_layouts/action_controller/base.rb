# frozen_string_literal: true
module Extensions::InheritedNestedLayouts::ActionController::Base
  # Gets the current layout used by this controller.
  #
  # @return [String] The layout used by the current controller.
  def current_layout
    _layout(formats)
  end

  # Gets the parent layout of the given layout, as specified in the layout hierarchy.
  #
  # @param [String] of_layout The layout to obtain the parent of. If this is nil, obtains the
  #   current controller's parent layout.
  # @return [String] The parent layout of the given layout.
  def parent_layout(of_layout: nil)
    layout = of_layout || current_layout
    layout_index = layout_hierarchy.find_index(layout)
    return nil if layout_index.nil? || layout_index == 0

    layout_hierarchy[layout_index - 1]
  end

  # Gets the layout hierarchy, from the outermost to the innermost layout.
  #
  # @return [Array<String>] The layout hierarchy for this controller.
  def layout_hierarchy
    extension_module = Extensions::InheritedNestedLayouts::ActionController::Base
    @layout_hierarchy ||=
      extension_module.class_hierarchy(self.class).
      select { |klass| klass < ActionController::Base }.
      map { |klass| extension_module.class_layout(klass, self, formats) }.
      select { |layout| !layout.nil? }.
      uniq.
      reverse!
  end

  # Gets the superclass hierarchy for the given class. Object is not part of the returned result.
  #
  # @param [Class] klass The class to obtain the hierarchy of.
  # @return [Array<String>] The superclass hierarchy for the given class.
  def self.class_hierarchy(klass)
    result = []
    while klass != Object
      result << klass
      klass = klass.superclass
    end

    result
  end

  # Gets the layout for objects of the given class.
  #
  # @param [Class] klass The class to obtain the layout of. This must be a subclass of
  #   ActionController::Base
  # @param [ActionController::Base] self_ The instance to query against the class hierarchy.
  # @return [String] The layout to use for instances of +klass+.
  def self.class_layout(klass, self_, formats)
    layout_method = klass.instance_method(:_layout)
    layout = layout_method.bind(self_)
    layout.call(formats)
  end

  # Overrides {ActionController::Rendering#render} to keep track of the :layout rendering option.
  def render(*args)
    options = args.extract_options!
    layout_hierarchy << options[:layout] if options.try(:key?, :layout)

    args << options
    super
  end
end
