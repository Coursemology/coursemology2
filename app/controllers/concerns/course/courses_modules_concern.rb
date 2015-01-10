module Course::CoursesModulesConcern
  extend ActiveSupport::Concern
  included do
    include Modular

    const_get(:Module).module_eval do
      const_set(:ClassMethods, Module.new) unless const_defined?(:ClassMethods)
      class_methods_module = const_get(:ClassMethods)

      class_methods_module.module_eval do
        include Sidebar
      end
    end
  end

  module Sidebar
    def sidebar(&proc)
      if proc
        sidebar_set(proc)
      else
        sidebar_get
      end
    end

    private

    def sidebar_set(proc)
      @sidebar = proc
    end

    def sidebar_get
      proc = @sidebar || ->() { [] }
      proc.call()
    end
  end
end
