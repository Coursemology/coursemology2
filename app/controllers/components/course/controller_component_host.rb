# frozen_string_literal: true
#
# The course component framework isolates features as components. The intent is to allow
# each feature to be enabled / disabled indepenedently within a course.
#
# When creating a component:
#
# - Your component class should `include Course::ControllerComponentHost::Component`.
# This injects the methods found in the {Course::ControllerComponentHost::Sidebar Sidebar}
# and {Course::ControllerComponentHost::Settings Settings} modules
# into the component. Override these methods to customise your component.
#
# - Your component class's initializer should take in the component host's context (a controller)
# as its only argument. You may do this by having your component inherit from `SimpleDelegator`.
# This allows you to call methods on the given context from your component, e.g. a call to
# {Course::Controller#current_course} will be delegated to the controller.
#
# - If your component has settings, you may define a settings model for it.
# (See {Course::ControllerComponentHost::Settings::ClassMethods#settings_class} for
# conventions to follow.)
#
# - You will also need to associate controllers for a component with the component class
# in order for it to be automatically enabled / disabled based on the course's settings
# (see {Course::ComponentController}).
#
class Course::ControllerComponentHost
  include Componentize

  module Sidebar
    extend ActiveSupport::Concern

    # Get the sidebar items and admin menu tab items from this component.
    #
    # @return [Array] An array of hashes containing the sidebar items exposed by this component.
    #   See {Course::ControllerComponentHost#sidebar_items} for the format.
    def sidebar_items
      []
    end
  end

  module Settings
    extend ActiveSupport::Concern

    delegate :enabled_by_default?, to: :class
    delegate :key, to: :class
    delegate :settings_class, to: :class

    module ClassMethods
      # @return [Boolean] the default enabled status of the component
      def enabled_by_default?
        true
      end

      # Unique key of the component, to serve as the key in settings and translations.
      #
      # @return [Symbol] the key
      def key
        name.underscore.tr('/', '_').to_sym
      end

      # Override this to customise the display name of the component.
      # The module name is the default display name.
      #
      # @return [String]
      def display_name
        name
      end

      # @return [Boolean] The gamfied status of the component. If true, the component will be
      #   disabled when the gamified flag in the course is false. Value is false by default.
      def gamified?
        false
      end

      # @return [Boolean] true if component can be disabled (or enabled) for individual courses.
      #   Otherwise, the component can only perhaps be disabled instance-wide.
      def can_be_disabled_for_course?
        true
      end

      # Returns a model which the current component can use to interface with its persisted
      # settings. The class initializer should take an instance of the component as its only
      # argument.
      #
      # Example:
      # If the component Course::FoobarComponent has settings, define a class
      # Course::Settings::FoobarComponent in the file
      # app/models/course/settings/foobar_component.rb.
      #
      # @return [Class] The settings interface class
      # @return [nil] if the class does not exist
      def settings_class
        @settings_class ||= "Course::Settings::#{name.demodulize}".safe_constantize
      end

      # Override in the component definition with the names of the actable types
      # if the component adds lesson plan items.
      # A component can specify multiple actable types for display on the lesson plan page.
      #
      # @return [Array<String>] actable types as an array of strings
      def lesson_plan_item_actable_names
        []
      end
    end

    # The settings interface instance for this component.
    #
    # @return An instance of the settings interface for the current component.
    # @return [nil] if the settings interface is not implemented.
    def settings
      @settings ||= settings_class&.new(self)
    end
  end

  # Open the Componentize Base Component.
  const_get(:Component).module_eval do
    const_set(:ClassMethods, ::Module.new) unless const_defined?(:ClassMethods)

    include Sidebar
    include Settings
  end

  # Eager load all the components declared.
  eager_load_components(File.join(__dir__, '../'))

  # Initializes the component host instance. This loads all components.
  #
  # @param context The context to execute all component instance methods on.
  def initialize(context)
    @context = context
    components
  end

  # @return [Array<Class>] Classes of effectively enabled components.
  def enabled_components
    @enabled_components ||= @context.current_course.enabled_components
  end

  # Instantiates the enabled components.
  #
  # @return [Array] The instantiated enabled components.
  def components
    @components ||= enabled_components.map { |component| component.new(@context) }
  end

  # Gets the component instance with the given key.
  #
  # @param [String|Symbol] component_key The key of the component to find.
  # @return [Object] The component with the given key.
  # @return [nil] If component is not enabled.
  def [](component_key)
    validate_component_key!(component_key)
    components.find { |component| component.key == component_key.to_sym }
  end

  # Gets the sidebar elements.
  #
  # Sidebar elements have the given format:
  #
  # ```
  #   {
  #      key: :item_key, # The unique key of the item to identify it among others. Can be nil if
  #                      # there is no need to distinguish between items.
  #                      # +normal+ type elements must have a key because their ordering is a
  #                      # user setting.
  #      title: 'Sidebar Item Title',
  #      type: :admin, # Will be considered as +:normal+ if not set. Currently +:normal+, +:admin+,
  #                    # and +:settings+ are used.
  #      weight: 100, # The default weight of the item. Larger weights (heavier items) sink.
  #      path: path_to_the_component,
  #      unread: 0 # Number of unread items. Can be +nil+, if not needed.
  #   }
  # ```
  #
  # The elements are rendered on all Course controller subclasses as part of a nested template.
  def sidebar_items
    @sidebar_items ||= components.flat_map(&:sidebar_items)
  end

  private

  # @param [String|Symbol] component_key The key of the component to validate.
  def validate_component_key!(key)
    raise ArgumentError, "Invalid component key: #{key}" unless component_key_set.include?(key.to_sym)
  end

  def component_key_set
    @component_key_set ||= Course::ControllerComponentHost.components.map(&:key).to_set
  end
end
