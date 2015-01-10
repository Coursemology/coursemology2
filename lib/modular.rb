# Allows associating classes with other classes. This can form a nesting hierarchy. This is also
# used in Coursemology to associate modules that a course can have enabled.
#
# Modules in this file refer to the concept, not the Ruby Module.
#
# In Development mode, classes are not eager loaded. Module hosts then do not know which modules
# have been implemented.
#
# @example Declare that a class can host other modules.
#   class Course
#     include Modular
#   end
#
# @example Declare that the Announcements class is a module belonging to a Course.
#   class Announcements
#     include Course::Module
#   end
module Modular
  extend ActiveSupport::Concern

  included do
    Modular.become_module_host(self)
  end

  private

  # Extends the given host with methods needed to host other classes.
  #
  # @param host [Class] The host to convert into a host.
  def self.become_module_host(host)
    return if host.include?(ModuleHost)
    host.const_set(:Module, base_module_for_host(host))

    host.class_eval do
      include ModuleHost
    end
  end

  # Creates a new base module for the given host.
  #
  # The base module is included by other modules to associate them with the host.
  #
  # @param host [Class] The class to make the base module for.
  # @return [Module] A new base module for the given host.
  def self.base_module_for_host(host)
    result = ::Module.new do
      include Module
      extend ActiveSupport::Concern

      included do
        host = class_variable_get(:@@host)
        host.add_module(self)
      end
    end

    result.class_variable_set(:@@host, host)
    result
  end

  # Templates for each instantiation of Modular
  module ModuleHost
    extend ActiveSupport::Concern

    included do
      class_attribute :module_names
      self.module_names = []
      private :module_names=

      class_attribute :module_file_path
    end

    module ClassMethods
      # Eager loads all modules in the provided path. Modules have the suffix `Module` in their
      # class names.
      #
      # @param in_path [Dir] The directory to eager load all modules from. The naming of the files
      #                      must follow Rails conventions.
      def eager_load_modules(in_path)
        base_path = Pathname.new(in_path.path).realpath

        Dir.glob("#{base_path}/**/*_module.rb").each do |file|
          relative_path = Pathname.new(file).relative_path_from(base_path)
          module_path = "#{relative_path.dirname}/#{relative_path.basename('.rb')}".camelize
          module_path.constantize
        end
      end

      # Associates the given module with the current host.
      #
      # @param module_ [Module] The module which included the host.
      def add_module(module_)
        module_names << module_.name unless module_names.include?(module_.name)
      end

      # Gets all the modules associated with this host.
      #
      # @return [Array] The modules associated with this host.
      def modules
        module_names.map { |module_| module_.constantize }
      end
    end
  end

  module Module
    extend ActiveSupport::Concern
  end
end
