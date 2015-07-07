class Course::ComponentHost
  include Componentize

  module Sidebar
    # Class method to declare the proc handling the sidebar menu items.
    #
    # @param [Proc] proc The proc handling the sidebar for the given component. The proc will be
    #   +instance_eval+ed in the context of the controller handling the current
    #   request. This proc must return an array of hashes, each describing one
    #   menu item.
    def sidebar(&proc)
      self.sidebar_proc = proc
    end

    # Class method to get the sidebar items from this component, in the context of the given
    # controller instance.
    #
    # @param [Course::Controller] controller The controller handling the current request.
    # @return [Array] An array of hashes containing the sidebar items exposed by this component.
    def get_sidebar_items(controller)
      return [] unless sidebar_proc

      controller.instance_exec(&sidebar_proc)
    end

    private

    attr_accessor :sidebar_proc
  end

  module Settings
    # Class method to declare the proc handling the course settings items.
    #
    # @param [Proc] proc The proc handling the settings for the given component. The proc will be
    #   +instance_eval+ed in the context of the controller handling the current
    #   request. This proc must return an array of hashes, each describing one
    #   component settings page.
    def settings(&proc)
      self.settings_proc = proc
    end

    # Class method to get the settings items from this component, in the context of the given
    # controller instance.
    #
    # @param [Course::Controller] controller The controller handling the current request.
    # @return [Array] An array of hashes containing the settings items exposed by this component.
    def get_settings_items(controller)
      return [] unless settings_proc

      controller.instance_exec(&settings_proc)
    end

    private

    attr_accessor :settings_proc
  end

  module Enableable
    # @return [Boolean] the default enabled status of the component
    def enabled_by_default?
      true
    end

    # Unique key of the component, to serve as the key in settings and translations
    #
    # @return [Symbol] the key
    def key
      name.underscore.sub('/', '_').to_sym
    end
  end

  # Open the Componentize Base Component.
  const_get(:Component).module_eval do
    const_set(:ClassMethods, ::Module.new) unless const_defined?(:ClassMethods)
    class_methods_module = const_get(:ClassMethods)

    # Inject our sidebar definition methods into ClassMethods.
    class_methods_module.module_eval do
      include Sidebar
      include Settings
      include Enableable
    end
  end

  # Eager load all the components declared.
  eager_load_components(File.join(__dir__, '../'))

  # Initialize the component host instance
  #
  # @param [#settings] instance_settings Instance settings object
  # @param [#settings] course_settings Course settings object
  # @param context The context to execute all component instance methods on.
  def initialize(instance_settings, course_settings, context)
    @instance_settings = instance_settings
    @course_settings = course_settings
    @context = context
  end

  # Apply preferences to all the components, returns the enabled components.
  #
  # @return [Array] array of enabled components
  def components
    instance_components.select do |m|
      enabled = @course_settings.settings(m.key).enabled
      enabled.nil? ? m.enabled_by_default? : enabled
    end
  end

  # Apply preferences to all the components, returns the disabled components.
  #
  # @return [Array] array of disabled components
  def disabled_components
    instance_components - components
  end

  # Returns the enabled components in instance.
  #
  # @return [Array] array of enabled components in instance
  def instance_components
    all_components = Course::ComponentHost.components
    all_components.select do |m|
      enabled = @instance_settings.settings(m.key).enabled
      enabled.nil? ? m.enabled_by_default? : enabled
    end
  end

  # Gets the sidebar elements.
  #
  # Sidebar elements have the given format:
  #
  #   {
  #      key: :sidebar_item_key # The unique key of the item, which will be used in sidebar settings
  #      title: 'Sidebar Item Title'
  #      type: :admin # Will be considered as `:normal` if not set
  #      weight: 100
  #      path: path_to_the_component
  #      unread: 0 # or nil
  #   }
  #
  # The elements are rendered on all Course controller subclasses as part of a nested template.
  def sidebar_items
    @sidebar_items ||= begin
      array_of_component_arrays = components.map do |component|
        component.get_sidebar_items(@context)
      end

      array_of_component_arrays.tap(&:flatten!)
    end
  end

  # Gets the settings items.
  #
  # Settings elements have the given format:
  #
  #   {
  #      title: 'Settings Item Title'
  #      controller: controller name, String or Symbol
  #      action: action name, String or Symbol
  #      weight: 1 # The weight which determines the order of the item
  #   }
  def settings
    @settings ||= begin
      array_of_component_arrays = components.map do |component|
        component.get_settings_items(@context)
      end

      array_of_component_arrays.tap(&:flatten!)
    end
  end
end
