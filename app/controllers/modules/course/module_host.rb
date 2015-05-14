class Course::ModuleHost
  include Modular

  module Sidebar
    # Class method to declare the proc handling the sidebar menu items.
    #
    # @param proc [Proc] The proc handling the sidebar for the given module. The proc will be
    #                    `instance_eval`ed in the context of the controller handling the current
    #                    request. This proc must return an array of hashes, each describing one
    #                    menu item.
    def sidebar(&proc)
      self.sidebar_proc = proc
    end

    # Class method to get the sidebar items from this module, in the context of the given
    # controller instance.
    #
    # @param controller [Course::Controller] The controller handling the current request.
    # @return [Array] An array of hashes containing the sidebar items exposed by this module.
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
    # @param proc [Proc] The proc handling the settings for the given module. The proc will be
    #                    `instance_eval`ed in the context of the controller handling the current
    #                    request. This proc must return an array of hashes, each describing one
    #                    module settings page.
    def settings(&proc)
      self.settings_proc = proc
    end

    # Class method to get the settings items from this module, in the context of the given
    # controller instance.
    #
    # @param controller [Course::Controller] The controller handling the current request.
    # @return [Array] An array of hashes containing the settings items exposed by this module.
    def get_settings_items(controller)
      return [] unless settings_proc

      controller.instance_exec(&settings_proc)
    end

    private

    attr_accessor :settings_proc
  end

  module Enableable
    # @return [Boolean] the default enabled status of the module
    def enabled_by_default?
      true
    end

    # Unique key of the module, to serve as the key in module_preference_objects and translations
    #
    # @return [Symbol] the key
    def key
      name.underscore.sub('/', '_').to_sym
    end
  end

  # Open the Modular Base Module.
  const_get(:Module).module_eval do
    const_set(:ClassMethods, ::Module.new) unless const_defined?(:ClassMethods)
    class_methods_module = const_get(:ClassMethods)

    # Inject our sidebar definition methods into ClassMethods.
    class_methods_module.module_eval do
      include Sidebar
      include Settings
      include Enableable
    end
  end

  # Eager load all the modules declared.
  eager_load_modules(File.join(__dir__, '../'))

  # Initialize the module host instance
  #
  # @param [#settings] instance settings object
  # @param [#settings] course settings object
  def initialize(instance_settings, course_settings)
    @instance_settings = instance_settings
    @course_settings = course_settings
  end

  # Apply preferences to all the modules, returns the enabled modules.
  #
  # @return [Array] array of enabled modules
  def modules
    instance_modules.select do |m|
      enabled = @course_settings.settings(m.key).enabled
      enabled.nil? ? m.enabled_by_default? : enabled
    end
  end

  # Apply preferences to all the modules, returns the disabled modules.
  #
  # @return [Array] array of disabled modules
  def disabled_modules
    instance_modules - modules
  end

  private

  def instance_modules #:nodoc:
    all_modules = Course::ModuleHost.modules
    all_modules.select do |m|
      enabled = @instance_settings.settings(m.key).enabled
      enabled.nil? ? m.enabled_by_default? : enabled
    end
  end
end
