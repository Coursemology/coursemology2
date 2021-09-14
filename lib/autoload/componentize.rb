# frozen_string_literal: true
# Allows associating classes with other classes. This can form a nesting hierarchy. This is also
# used in Coursemology to associate components that a course can have enabled.
#
# In Development mode, classes are not eager loaded. Component hosts then do not know which
# components have been implemented. Call #{Componentize.eager_load_components} to load all
# components within a given path.
#
# @example Declare that a class can host other components.
#   class Course
#     include Componentize
#   end
#
# @example Declare that the Announcements class is a component belonging to a Course.
#   class Announcements
#     include Course::Component
#   end
module Componentize
  extend ActiveSupport::Concern

  included do
    Componentize.become_component_host(self)
  end

  # Extends the given host with methods needed to host other classes.
  #
  # @param [Class] host The host to convert into a host.
  def self.become_component_host(host)
    return if host.include?(ComponentHost)

    host.const_set(:Component, base_component_for_host(host))

    host.class_eval do
      include ComponentHost
    end
  end

  # Creates a new base module for the given host.
  #
  # The base component is included by other components to associate them with the host.
  #
  # @param [Class] host The class to make the base component for.
  # @return [Component] A new base component for the given host.
  def self.base_component_for_host(host)
    result = ::Module.new do
      include Component
      extend ActiveSupport::Concern

      included do
        host = class_variable_get(:@@host)
        host.add_component(self)
      end
    end

    result.class_variable_set(:@@host, host)
    result
  end
  private_class_method :base_component_for_host

  # Templates for each instantiation of Modular
  module ComponentHost
    extend ActiveSupport::Concern

    included do
      class_attribute :component_names
      self.component_names = []
      private :component_names=

      class_attribute :component_file_path
    end

    module ClassMethods
      # Eager loads all components in the provided path. Components have the suffix `Component` in
      # their class names.
      #
      # @param [Dir|String] in_path The directory to eager load all components from. The naming of
      # the files must follow Rails conventions.
      def eager_load_components(in_path)
        if in_path.is_a?(String)
          return unless Dir.exist?(in_path)

          in_path = Dir.open(in_path)
        end

        base_path = Pathname.new(in_path.path).realpath

        Dir.glob("#{base_path}/**/*_component.rb").each do |file|
          load_component(file, base_path)
        end
      end

      # Associates the given component with the current host.
      #
      # @param [Component] component The component which included the host.
      def add_component(component)
        component_names << component.name unless component_names.include?(component.name)
      end

      # Gets all the components associated with this host.
      #
      # @return [Array<Component>] The components associated with this host.
      def components
        component_names.map(&:constantize)
      end

      private

      # Loads the given component at the specified path.
      #
      # @param [String] path The absolute path to the file.
      # @param [Pathname] base_path The root directory where components are found. This is to deduce
      #   the name of the class defined in the given file.
      def load_component(path, base_path)
        relative_path = Pathname.new(path).relative_path_from(base_path)

        require_dependency(path)
        class_in_path(relative_path).constantize
      end

      # Deduce the name of the class that is defined in the given path. This follows Rails naming
      # conventions.
      #
      # @example class_in_path(Pathname.new('test.rb')) => 'Test'
      # @example class_in_path(Pathname.new('Test/test.rb')) => 'Test::Test'
      #
      # @param [Pathname] relative_path The relative path to the file.
      # @return [String] The name of the class defined in the path.
      def class_in_path(relative_path)
        component_path = "#{relative_path.dirname}/#{relative_path.basename('.rb')}".camelize

        name_components = component_path.split('::')
        name_components.shift if name_components.length > 1 && name_components[0] == '.'
        name_components.join('::')
      end
    end
  end

  module Component
    extend ActiveSupport::Concern
  end
end
