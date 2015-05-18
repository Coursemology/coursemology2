class Course::Controller < ApplicationController
  load_and_authorize_resource :course

  # Gets the sidebar elements.
  #
  # Sidebar elements have the given format:
  #
  # ```
  # {
  #    title: 'Sidebar Item Title'
  #    unread: 0 # or nil
  # }
  # ```
  #
  # The elements are rendered on all Course controller subclasses as part of a nested template.
  def sidebar
    array_of_component_arrays = Course::ComponentHost.components.map do |component|
      component.get_sidebar_items(self)
    end

    array_of_component_arrays.tap(&:flatten!)
  end

  # Gets the settings items.
  #
  # Settings elements have the given format:
  #
  # ```
  # {
  #    title: 'Settings Item Title'
  #    controller: controller name, String or Symbol
  #    action: action name, String or Symbol
  # }
  # ```
  def settings
    array_of_component_arrays = Course::ComponentHost.components.map do |component|
      component.get_settings_items(self)
    end

    array_of_component_arrays.tap(&:flatten!)
  end
end
