module Course::CoursesModulesConcern
  extend ActiveSupport::Concern
  included do
    include Modular

    # Open the Modular Base Module.
    const_get(:Module).module_eval do
      const_set(:ClassMethods, Module.new) unless const_defined?(:ClassMethods)
      class_methods_module = const_get(:ClassMethods)

      # Inject our sidebar definition methods into ClassMethods.
      class_methods_module.module_eval do
        include Sidebar
      end
    end

    # Eager load all the modules declared.
    eager_load_modules(Dir.open(File.join(__dir__, '../../modules')))
  end

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
end
