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
      def add_module(module_)
        modules << module_
      end
    end
  end

  module Module
    extend ActiveSupport::Concern
  end
end
